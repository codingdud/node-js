# ⚛️ MongoDB Atomicity & Transactions — Complete Advanced Guide

---

## 📌 Table of Contents

1. [What is Atomicity?](#1-what-is-atomicity)
2. [Single-Document Atomicity](#2-single-document-atomicity)
3. [Concurrent Update Conflicts](#3-concurrent-update-conflicts)
4. [Safe Concurrent Patterns](#4-safe-concurrent-patterns)
5. [Multi-Document Operations (Non-Atomic)](#5-multi-document-operations)
6. [Distributed Transactions](#6-distributed-transactions)
7. [Transaction Syntax & API](#7-transaction-syntax--api)
8. [Read & Write Concerns in Transactions](#8-read--write-concerns)
9. [Transaction Isolation Levels](#9-transaction-isolation-levels)
10. [Error Handling & Retry Logic](#10-error-handling--retry-logic)
11. [Transactions on Sharded Clusters](#11-sharded-cluster-transactions)
12. [Performance Considerations](#12-performance-considerations)
13. [Schema Design vs Transactions](#13-schema-design-vs-transactions)
14. [Real-World Patterns](#14-real-world-patterns)
15. [Quick Reference Cheat Sheet](#15-cheat-sheet)

---

## 1. What is Atomicity?

> **Atomicity** means an operation either **completes fully or not at all** — there is no partial state visible to other operations.

This is the **"A"** in the **ACID** properties:

| Property    | Meaning                                                         |
|-------------|-----------------------------------------------------------------|
| **A**tomicity  | All or nothing — no partial writes                          |
| **C**onsistency | Data moves from one valid state to another                 |
| **I**solation   | Concurrent transactions don't interfere with each other    |
| **D**urability  | Committed data persists even after crashes                  |

---

## 2. Single-Document Atomicity

> MongoDB guarantees **atomic writes at the single-document level** — always, for free, no transaction needed.

This is possible because MongoDB stores related data as **embedded documents and arrays** in one document.

```js
// This ENTIRE update is atomic — no partial state is visible
db.users.updateOne(
  { _id: ObjectId("abc123") },
  {
    $set: { status: "active", lastLogin: new Date() },
    $inc: { loginCount: 1 },
    $push: { loginHistory: { date: new Date(), ip: "192.168.1.1" } }
  }
)
// ✅ Either ALL three changes apply, or NONE do
```

### Why Single-Document is So Powerful

```
// SQL (relational) often needs multi-table writes:
UPDATE users SET status = 'active' WHERE id = 1;     -- table 1
UPDATE user_sessions SET count = count + 1 WHERE user_id = 1; -- table 2
INSERT INTO audit_log (user_id, action) VALUES (1, 'login'); -- table 3
// ☠️ Requires a transaction to be atomic

// MongoDB equivalent — ONE atomic document write:
db.users.updateOne({ _id: 1 }, {
  $set: { status: "active" },
  $inc: { "sessions.count": 1 },
  $push: { auditLog: { action: "login", date: new Date() } }
})
// ✅ Atomic by default — no transaction needed
```

---

## 3. Concurrent Update Conflicts

Understanding what happens when two operations run **simultaneously** on the same document.

---

### ✅ Safe Pattern — Filter on Updated Field

> Include the **current expected value** in the query filter. Only one concurrent update will succeed.

```js
// Setup
db.games.insertOne({ _id: 1, score: 80 })

// Two concurrent operations:
// Update A
db.games.updateOne(
  { score: 80 },           // ← filter on the value being changed
  { $set: { score: 90 } }
)

// Update B
db.games.updateOne(
  { score: 80 },           // ← same filter
  { $set: { score: 100 } }
)
```

**What happens:**

```
Time ──────────────────────────────────────────────────►

  Update A reads score=80, matches filter → sets score=90  ✅
  Update B reads score=80... but score is now 90 → NO MATCH ✅ (safely skipped)

Final score: 90 (deterministic)
```

> This is a form of **Optimistic Concurrency Control (OCC)** — no locks, just validation.

---

### ⚠️ Dangerous Pattern — Filter on Non-Updated Field

> Filtering on `_id` (or any field you're NOT modifying) means **both updates always match** and the last one wins silently.

```js
// ❌ DANGEROUS — both will match and run
// Update A
db.games.updateOne(
  { _id: 1 },             // ← _id never changes
  { $set: { score: 90 } }
)

// Update B
db.games.updateOne(
  { _id: 1 },             // ← _id never changes
  { $set: { score: 100 } }
)
```

**What happens:**

```
Time ──────────────────────────────────────────────────►

  Update A: matches _id=1 → sets score=90
  Update B: matches _id=1 → sets score=100   ← overwrites A silently!

Final score: 100  (Update A's write is LOST with NO ERROR)
```

> ☠️ The first client receives a **successful response** but its write is overwritten. This is a **silent data loss** bug.

---

### ✅ Safe Pattern — Use $inc Instead of $set

> For numeric counters and accumulators, `$inc` is **inherently safe** under concurrency. Both updates apply without overwriting each other.

```js
// Safe concurrent increments
// Update A
db.games.updateOne(
  { _id: 1 },
  { $inc: { score: 10 } }   // adds 10
)

// Update B
db.games.updateOne(
  { _id: 1 },
  { $inc: { score: 20 } }   // adds 20
)
```

**What happens:**

```
Initial score: 80

  Update A: 80 + 10 = 90
  Update B: 90 + 20 = 110  (or 80+20=100, then 100+10=110 — same result)

Final score: 110 ✅ — both increments applied regardless of order
```

### Comparison Table

| Scenario                          | Operator     | Safe? | Notes                           |
|-----------------------------------|--------------|-------|---------------------------------|
| Set absolute value (filter on it) | `$set`       | ✅    | OCC — second op fails to match  |
| Set absolute value (filter on _id)| `$set`       | ❌    | Silent overwrite — data loss    |
| Add/subtract a number             | `$inc`       | ✅    | Commutative — order doesn't matter |
| Multiply                          | `$mul`       | ✅    | Commutative                     |
| Push to array                     | `$push`      | ✅    | Appends independently           |
| Add to set                        | `$addToSet`  | ✅    | Idempotent                      |
| Set minimum value                 | `$min`       | ✅    | Safe for high-water marks       |
| Set maximum value                 | `$max`       | ✅    | Safe for low-water marks        |

---

## 4. Safe Concurrent Patterns

### Pattern 1: Optimistic Concurrency with Version Field

```js
// Add a version field to documents
db.products.insertOne({ _id: 1, name: "Widget", price: 50, __v: 0 })

// Read current state
const product = db.products.findOne({ _id: 1 })

// Update ONLY IF version matches (no one else updated it)
const result = db.products.updateOne(
  { _id: 1, __v: product.__v },      // ← version check
  {
    $set: { price: 75 },
    $inc: { __v: 1 }                 // ← bump version
  }
)

if (result.matchedCount === 0) {
  // Someone else updated first — retry or throw conflict error
  throw new Error("Concurrent modification detected — please retry")
}
```

---

### Pattern 2: findOneAndUpdate (Atomic Read-Modify-Write)

```js
// Atomically find AND update in one operation — returns old or new value
const updated = db.inventory.findOneAndUpdate(
  { _id: "item1", quantity: { $gte: 5 } },  // only update if enough stock
  { $inc: { quantity: -5 } },               // decrement atomically
  {
    returnDocument: "after",                 // return updated doc
    upsert: false
  }
)

if (!updated) {
  throw new Error("Insufficient stock")
}
```

---

### Pattern 3: findOneAndUpdate as a Queue/Lock

```js
// Claim a task — atomic "dequeue" operation
const task = db.tasks.findOneAndUpdate(
  { status: "pending" },                    // find unclaimed task
  {
    $set: {
      status: "processing",
      claimedBy: "worker-1",
      claimedAt: new Date()
    }
  },
  { sort: { priority: -1 }, returnDocument: "after" }
)
// ✅ Only ONE worker gets each task — atomic claim
```

---

### Pattern 4: Enforce Uniqueness with Unique Index

```js
// Create a unique index to prevent duplicate inserts under concurrency
db.users.createIndex({ email: 1 }, { unique: true })

// Both concurrent inserts:
db.users.insertOne({ email: "alice@example.com", name: "Alice" }) // ✅
db.users.insertOne({ email: "alice@example.com", name: "Alice2" }) // ❌ DuplicateKeyError

// Handle gracefully
try {
  db.users.insertOne({ email: "alice@example.com" })
} catch (e) {
  if (e.code === 11000) {
    console.log("Email already exists")
  }
}
```

---

## 5. Multi-Document Operations

> When a single write modifies **multiple documents** (e.g., `updateMany`), each **individual document update is atomic**, but the **overall operation is NOT atomic**.

```js
// This updates thousands of documents — NOT atomic as a whole
db.products.updateMany(
  { category: "Electronics" },
  { $inc: { price: 10 } }
)
```

**What this means in practice:**

```
Document 1 update → atomic ✅
Document 2 update → atomic ✅
           ↕ ← another query can read here and see partial state
Document 3 update → atomic ✅
...
Document N update → atomic ✅

But between ANY two document updates, other operations can read mixed state!
```

### Interleaving Risk Example

```js
// Client A: running updateMany to mark all orders as "archived"
db.orders.updateMany({ status: "completed" }, { $set: { status: "archived" } })

// Client B: simultaneously reading orders (can see mix of "completed" and "archived")
db.orders.find({ status: "completed" })  // may return 0 to N results mid-update
```

> For true all-or-nothing multi-document writes, you need **Transactions**.

---

## 6. Distributed Transactions

> MongoDB supports **multi-document ACID transactions** on replica sets (4.0+) and sharded clusters (4.2+).

### Transaction Guarantees

```
┌────────────────────────────────────────────────────────────┐
│              TRANSACTION GUARANTEES                        │
│                                                            │
│  ✅ Atomic    — All operations commit or all abort        │
│  ✅ Consistent — Database moves between valid states      │
│  ✅ Isolated  — Other ops see either before or after      │
│  ✅ Durable   — Committed data survives failures          │
└────────────────────────────────────────────────────────────┘
```

### When to Use Transactions

```
USE a transaction when:                   DON'T use when:
───────────────────────────────────────   ─────────────────────────────────
✅ Moving money between accounts          ❌ Single document update
✅ Inventory deduction + order creation   ❌ Simple counters ($inc)
✅ Writing to multiple collections         ❌ Log/audit inserts (append-only)
✅ Saga pattern with compensating ops     ❌ Can embed data in one document
✅ Referential integrity across docs      ❌ High-throughput write streams
```

---

## 7. Transaction Syntax & API

### Basic Transaction (Node.js)

```js
const { MongoClient } = require("mongodb")
const client = new MongoClient(uri)
const session = client.startSession()

try {
  session.startTransaction({
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" }
  })

  const accounts = client.db("bank").collection("accounts")

  // Operation 1: Debit sender
  await accounts.updateOne(
    { _id: "alice", balance: { $gte: 200 } },  // check sufficient funds
    { $inc: { balance: -200 } },
    { session }                                 // ← MUST pass session
  )

  // Operation 2: Credit receiver
  await accounts.updateOne(
    { _id: "bob" },
    { $inc: { balance: 200 } },
    { session }                                 // ← MUST pass session
  )

  // Operation 3: Log the transfer
  await client.db("bank").collection("transfers").insertOne(
    { from: "alice", to: "bob", amount: 200, date: new Date() },
    { session }
  )

  // Commit — all 3 ops apply atomically
  await session.commitTransaction()
  console.log("Transfer complete ✅")

} catch (error) {
  // Abort — all 3 ops are rolled back
  await session.abortTransaction()
  console.error("Transfer failed, rolled back ❌", error)
} finally {
  await session.endSession()
}
```

---

### MongoDB Shell Transaction

```js
const session = db.getMongo().startSession()
session.startTransaction()

try {
  const accounts = session.getDatabase("bank").getCollection("accounts")

  accounts.updateOne(
    { _id: "alice" },
    { $inc: { balance: -200 } }
  )

  accounts.updateOne(
    { _id: "bob" },
    { $inc: { balance: 200 } }
  )

  session.commitTransaction()
} catch (e) {
  session.abortTransaction()
  throw e
} finally {
  session.endSession()
}
```

---

### withTransaction() Helper (Auto Retry)

```js
// ✅ RECOMMENDED — handles retry logic automatically
const session = client.startSession()

await session.withTransaction(async () => {
  const accounts = client.db("bank").collection("accounts")

  await accounts.updateOne(
    { _id: "alice" },
    { $inc: { balance: -200 } },
    { session }
  )

  await accounts.updateOne(
    { _id: "bob" },
    { $inc: { balance: 200 } },
    { session }
  )
  // Automatically commits, retries on transient errors, aborts on others
}, {
  readPreference: "primary",
  readConcern: { level: "local" },
  writeConcern: { w: "majority" }
})

session.endSession()
```

---

## 8. Read & Write Concerns

### Write Concern

Controls **how many nodes** must acknowledge a write before it's considered successful.

```js
// w: 1 — acknowledged by primary only (default, fast)
await collection.insertOne(doc, { writeConcern: { w: 1 } })

// w: "majority" — acknowledged by majority of replica set nodes (safer, recommended for transactions)
await collection.insertOne(doc, { writeConcern: { w: "majority" } })

// w: 0 — fire and forget (no acknowledgment — fast but risky)
await collection.insertOne(doc, { writeConcern: { w: 0 } })

// j: true — write committed to journal on disk before acknowledge
await collection.insertOne(doc, { writeConcern: { w: "majority", j: true } })
```

### Read Concern

Controls the **consistency level** of data read inside transactions.

| Level        | Description                                          | Use Case                      |
|--------------|------------------------------------------------------|-------------------------------|
| `local`      | Returns latest data, may not be majority-committed   | Low-latency reads             |
| `available`  | Like local but for sharded clusters                  | Highest availability          |
| `majority`   | Returns only majority-committed data                 | Prevent dirty reads           |
| `snapshot`   | Reads consistent point-in-time snapshot              | Transactions (recommended)    |
| `linearizable`| Most strict — reflects all preceding majority writes| Critical consistency needs   |

```js
session.startTransaction({
  readConcern: { level: "snapshot" },   // ← consistent view across all reads
  writeConcern: { w: "majority" }       // ← durable across replica set
})
```

---

## 9. Transaction Isolation Levels

MongoDB transactions use **Snapshot Isolation**.

```
Timeline:
T=0: Transaction starts — takes a consistent "snapshot" of the database

  T=1: Another client inserts a new order document
  T=2: Another client updates a product's price

T=3: Transaction reads orders → does NOT see T=1's insert
T=4: Transaction reads products → does NOT see T=2's update

T=5: Transaction commits with its own writes

// The transaction sees a frozen consistent view from T=0
```

### Read Your Own Writes

```js
// Within a transaction, you CAN see your own uncommitted writes
session.startTransaction()

await collection.insertOne({ _id: 1, name: "Test" }, { session })

// ✅ Can read it back within same transaction
const doc = await collection.findOne({ _id: 1 }, { session })
console.log(doc) // → { _id: 1, name: "Test" }

// ❌ Other sessions CANNOT see this yet (not committed)
await session.commitTransaction()
// ✅ Now ALL sessions can see it
```

---

## 10. Error Handling & Retry Logic

### Retryable Error Codes

```js
// These errors are safe to retry — transaction can be restarted
const TRANSIENT_ERRORS = [
  112,  // WriteConflict — two transactions modified same document
  244,  // MaxTimeMSExpired
  251,  // NoSuchTransaction
  256,  // InterruptedDueToReplStateChange
]

// UnknownTransactionCommitResult — may have committed, RETRY COMMIT ONLY
const UNKNOWN_COMMIT_ERRORS = ["UnknownTransactionCommitResult"]
```

### Full Production-Grade Retry Pattern

```js
async function runTransactionWithRetry(txnFunc, session) {
  while (true) {
    try {
      await txnFunc(session)   // perform transaction
      break                    // success — exit loop
    } catch (error) {
      if (
        error.errorLabels &&
        error.errorLabels.includes("TransientTransactionError")
      ) {
        // Safe to retry entire transaction
        console.warn("TransientTransactionError, retrying transaction...")
        continue
      }
      throw error
    }
  }
}

async function commitWithRetry(session) {
  while (true) {
    try {
      await session.commitTransaction()
      console.log("Transaction committed ✅")
      break
    } catch (error) {
      if (
        error.errorLabels &&
        error.errorLabels.includes("UnknownTransactionCommitResult")
      ) {
        // Unknown if committed — retry commit only (not the whole transaction)
        console.warn("UnknownTransactionCommitResult, retrying commit...")
        continue
      }
      throw error
    }
  }
}

// Usage
const session = client.startSession()
try {
  await runTransactionWithRetry(async (session) => {
    session.startTransaction()
    // ... your operations ...
    await commitWithRetry(session)
  }, session)
} finally {
  session.endSession()
}
```

### Write Conflict Example

```js
// Two transactions try to modify the same document
// Transaction 1 commits first → Transaction 2 gets WriteConflict (error code 112)
// Transaction 2 must be retried from the beginning

session.startTransaction()
try {
  await collection.updateOne({ _id: 1 }, { $inc: { count: 1 } }, { session })
  await session.commitTransaction()
} catch (e) {
  if (e.code === 112) { // WriteConflict
    await session.abortTransaction()
    // retry the transaction
  }
}
```

---

## 11. Sharded Cluster Transactions

> Multi-document transactions on **sharded clusters** are supported from MongoDB **4.2+**.

```js
// Works exactly like replica set transactions — same API
// MongoDB handles cross-shard coordination internally (2-phase commit)

session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" },
  maxCommitTimeMS: 1000   // ← important for sharded clusters
})

// Operations can span multiple shards transparently
await db.collection("orders").insertOne({ userId: "u1", total: 200 }, { session })
await db.collection("inventory").updateOne(
  { sku: "item1" },
  { $inc: { quantity: -1 } },
  { session }
)

await session.commitTransaction()
```

### Sharded Transaction Constraints

```
⚠️ LIMITATIONS on sharded transactions:

1. Cannot create new collections inside a transaction on a sharded cluster
2. Cannot create indexes inside a transaction
3. Cross-shard transactions have higher latency (2PC protocol overhead)
4. maxCommitTimeMS should be set explicitly (default: 60 seconds)
5. Transactions touching many shards = higher contention risk
```

---

## 12. Performance Considerations

### Transaction Overhead

```
Single document write:    ~1ms   (no coordination needed)
Replica set transaction:  ~5ms   (replication acknowledgment)
Sharded transaction:      ~15ms  (cross-shard 2PC coordination)
```

### Transaction Time Limits

```js
// Default: 60 seconds max transaction runtime
// Default: 5ms lock acquisition timeout (before WriteConflict)

// Override per-transaction
session.startTransaction({
  maxCommitTimeMS: 5000  // 5 seconds
})

// Global server setting (mongod.conf)
// transactionLifetimeLimitSeconds: 60
```

### Reducing Transaction Contention

```js
// ❌ BAD — long-running operation inside transaction
session.startTransaction()
const data = await fetchFromExternalAPI()  // network call inside transaction!
await collection.insertOne(data, { session })
await session.commitTransaction()

// ✅ GOOD — do expensive work BEFORE starting transaction
const data = await fetchFromExternalAPI()  // outside transaction
session.startTransaction()
await collection.insertOne(data, { session })
await session.commitTransaction()
```

### Guidelines

| Recommendation                        | Why                                          |
|---------------------------------------|----------------------------------------------|
| Keep transactions short               | Reduces lock contention                      |
| Do work outside transaction first     | Minimize time holding locks                  |
| Avoid user input inside transactions  | Users are slow — transactions should be fast |
| Use `writeConcern: majority`           | Ensures durability                           |
| Limit documents touched per txn       | More docs = more contention                  |
| Prefer single-doc writes when possible| 10–100x cheaper than transactions            |

---

## 13. Schema Design vs Transactions

> MongoDB's official recommendation: **Good schema design eliminates most transaction needs.**

### Embedding vs Transactions

```js
// ❌ Normalized (relational-style) — requires transaction for atomic order creation
db.orders.insertOne({ _id: "o1", userId: "u1" })         // collection 1
db.orderItems.insertMany([                                // collection 2
  { orderId: "o1", sku: "item1", qty: 2 },
  { orderId: "o1", sku: "item2", qty: 1 }
])
// Need transaction to keep these in sync!

// ✅ Embedded (document model) — atomic with NO transaction
db.orders.insertOne({
  _id: "o1",
  userId: "u1",
  items: [
    { sku: "item1", qty: 2, price: 30 },
    { sku: "item2", qty: 1, price: 50 }
  ],
  total: 110
})
// Single document = single atomic write ✅
```

### When Embedding Isn't Enough

```
Use a transaction when data MUST live in separate documents because:

- Documents grow too large (16MB BSON limit)
- Data is shared across many parent documents
- Different access patterns require separate collections
- Regulatory/compliance requires separate storage
```

---

## 14. Real-World Patterns

---

### 🏦 Bank Transfer (Classic ACID Example)

```js
async function transferFunds(fromId, toId, amount) {
  const session = client.startSession()

  try {
    await session.withTransaction(async () => {
      const accounts = client.db("bank").collection("accounts")

      // Debit sender (check balance atomically)
      const debit = await accounts.findOneAndUpdate(
        { _id: fromId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { session, returnDocument: "after" }
      )

      if (!debit) throw new Error("Insufficient funds or account not found")

      // Credit receiver
      await accounts.updateOne(
        { _id: toId },
        { $inc: { balance: amount } },
        { session }
      )

      // Audit log
      await client.db("bank").collection("transactions").insertOne({
        type: "transfer",
        from: fromId,
        to: toId,
        amount,
        timestamp: new Date()
      }, { session })
    })
  } finally {
    session.endSession()
  }
}
```

---

### 🛒 E-Commerce: Reserve Stock + Create Order

```js
async function placeOrder(userId, items) {
  const session = client.startSession()

  try {
    await session.withTransaction(async () => {
      const db = client.db("shop")

      // Step 1: Decrement inventory (check availability per item)
      for (const item of items) {
        const result = await db.collection("inventory").findOneAndUpdate(
          { sku: item.sku, quantity: { $gte: item.qty } },
          { $inc: { quantity: -item.qty } },
          { session }
        )
        if (!result) {
          throw new Error(`Insufficient stock for ${item.sku}`)
          // ← transaction auto-aborts — inventory restored
        }
      }

      // Step 2: Create order
      const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
      await db.collection("orders").insertOne({
        userId,
        items,
        total,
        status: "confirmed",
        createdAt: new Date()
      }, { session })

      // Step 3: Update user's order count
      await db.collection("users").updateOne(
        { _id: userId },
        { $inc: { orderCount: 1 } },
        { session }
      )
    })
  } finally {
    session.endSession()
  }
}
```

---

### 🎟️ Ticket Booking (Prevent Double-Booking)

```js
async function bookSeat(eventId, seatId, userId) {
  const session = client.startSession()

  try {
    await session.withTransaction(async () => {
      const seats = client.db("events").collection("seats")

      // Atomically claim seat — fails if already booked
      const result = await seats.findOneAndUpdate(
        {
          _id: seatId,
          eventId: eventId,
          status: "available"           // only claim if available
        },
        {
          $set: {
            status: "booked",
            bookedBy: userId,
            bookedAt: new Date()
          }
        },
        { session, returnDocument: "after" }
      )

      if (!result) throw new Error("Seat unavailable or already booked")

      // Create booking record
      await client.db("events").collection("bookings").insertOne({
        userId,
        seatId,
        eventId,
        confirmedAt: new Date()
      }, { session })
    })
  } finally {
    session.endSession()
  }
}
```

---

### 📦 Distributed Saga Pattern (Compensating Transactions)

```js
// For long-running flows, use sagas with compensation instead of one giant transaction

class OrderSaga {
  async execute(order) {
    const steps = []

    try {
      // Step 1: Reserve inventory
      await this.reserveInventory(order)
      steps.push("inventory")

      // Step 2: Charge payment
      await this.chargePayment(order)
      steps.push("payment")

      // Step 3: Create shipment
      await this.createShipment(order)
      steps.push("shipment")

    } catch (error) {
      // Compensate in reverse order
      console.error("Saga failed at:", steps[steps.length - 1])

      if (steps.includes("shipment")) await this.cancelShipment(order)
      if (steps.includes("payment")) await this.refundPayment(order)
      if (steps.includes("inventory")) await this.releaseInventory(order)

      throw error
    }
  }
}
```

---

## 15. Cheat Sheet

```
ATOMICITY LEVEL        GUARANTEE                  REQUIRES
─────────────────────────────────────────────────────────────────────
Single document        Always atomic              Nothing extra
Multi-field update     Always atomic              Nothing extra
updateMany             Per-document atomic        NOT whole-op atomic
Multi-document         Atomic                     Transaction

SAFE CONCURRENT OPS    USE                        AVOID
─────────────────────────────────────────────────────────────────────
Counter increment      $inc                       $set on same field
Append to array        $push                      Manual array rebuild
Conditional update     Filter on updated value    Filter only on _id
Unique enforcement     Unique index               Application logic
Atomic read+write      findOneAndUpdate           find then update

TRANSACTION BASICS     COMMAND
─────────────────────────────────────────────────────────────────────
Start                  session.startTransaction()
Commit                 session.commitTransaction()
Abort (rollback)       session.abortTransaction()
Auto-retry helper      session.withTransaction(fn)
End session            session.endSession()
Pass to operation      { session } option on every op

READ/WRITE CONCERNS    RECOMMENDED FOR TRANSACTIONS
─────────────────────────────────────────────────────────────────────
readConcern            snapshot
writeConcern           majority

ERROR LABELS           ACTION
─────────────────────────────────────────────────────────────────────
TransientTransactionError    Retry entire transaction
UnknownTransactionCommitResult  Retry commit only

DESIGN DECISION TREE
─────────────────────────────────────────────────────────────────────
Can I embed data in one document?
  → YES → Use single-doc write (atomic, fast, no transaction)
  → NO  → Can I use $inc/$push instead of $set?
            → YES → Concurrent-safe without transaction
            → NO  → Use multi-document transaction
```

---

*Guide covers MongoDB 4.0 – 7.x | Transactions require replica set or sharded cluster*
