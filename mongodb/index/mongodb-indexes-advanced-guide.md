# 🗂️ MongoDB Indexes — Complete Advanced Guide

---

## 📌 Table of Contents

1. [What Are Indexes?](#1-what-are-indexes)
2. [How MongoDB Indexes Work (B-Tree)](#2-how-mongodb-indexes-work)
3. [Index Types](#3-index-types)
   - [Single Field Index](#single-field-index)
   - [Compound Index](#compound-index)
   - [Multikey Index (Array Fields)](#multikey-index)
   - [Text Index](#text-index)
   - [Geospatial Index (2dsphere / 2d)](#geospatial-index)
   - [Hashed Index](#hashed-index)
   - [Wildcard Index](#wildcard-index)
   - [Clustered Index](#clustered-index)
4. [Index Properties](#4-index-properties)
   - [Unique Index](#unique-index)
   - [Sparse Index](#sparse-index)
   - [Partial Index](#partial-index)
   - [TTL Index (Auto Expire)](#ttl-index)
   - [Hidden Index](#hidden-index)
   - [Case-Insensitive Index](#case-insensitive-index)
5. [Default _id Index](#5-default-_id-index)
6. [Compound Index — Deep Dive](#6-compound-index-deep-dive)
7. [ESR Rule (Equality → Sort → Range)](#7-esr-rule)
8. [Covered Queries](#8-covered-queries)
9. [Index Intersection](#9-index-intersection)
10. [Query Plan & explain()](#10-query-plan--explain)
11. [Index Limitations](#11-index-limitations)
12. [Index Management](#12-index-management)
13. [Performance Tips & Anti-Patterns](#13-performance-tips--anti-patterns)
14. [Real-World Index Strategy Examples](#14-real-world-examples)
15. [Quick Reference Cheat Sheet](#15-cheat-sheet)

---

## 1. What Are Indexes?

> Without indexes, MongoDB performs a **Collection Scan** — reading every document. With indexes, it performs a fast **Index Scan** on a small sorted B-tree.

```
WITHOUT INDEX:                  WITH INDEX:
┌────────────────────┐         ┌──────────────────┐
│ Scan ALL documents │   vs    │ B-Tree lookup     │
│ O(n) — slow        │         │ O(log n) — fast   │
└────────────────────┘         └──────────────────┘
```

### Trade-Offs

| Aspect          | With Index        | Without Index     |
|-----------------|-------------------|-------------------|
| Read Speed      | ✅ Fast            | ❌ Slow (full scan)|
| Write Speed     | ❌ Slightly slower | ✅ Faster          |
| Storage         | ❌ Extra disk use  | ✅ Less disk use   |
| Memory (RAM)    | ❌ Index in RAM    | ✅ Less RAM use    |

> **Rule of Thumb:** Index read-heavy fields. Avoid over-indexing write-heavy collections.

---

## 2. How MongoDB Indexes Work

MongoDB indexes use a **B-tree (Balanced Binary Search Tree)** structure.

```
           [50]
          /    \
       [25]    [75]
       /  \    /  \
    [10] [30][60] [90]
```

- Each leaf node stores the **indexed field value + pointer to document (_id)**
- Tree stays **balanced** — ensuring O(log n) lookup time
- Supports **range queries**, **equality matches**, and **sort operations**

---

## 3. Index Types

---

### Single Field Index

Index on **one field**. Works for equality, range, and sort.

```js
// Create ascending index on age
db.users.createIndex({ age: 1 })

// Create descending index
db.users.createIndex({ createdAt: -1 })

// Index on nested field
db.users.createIndex({ "address.city": 1 })

// Index on entire embedded document
// ⚠️ Only queries matching the EXACT embedded doc use this
db.users.createIndex({ address: 1 })
```

**Queries that USE this index:**
```js
db.users.find({ age: 25 })                    // ✅ equality
db.users.find({ age: { $gt: 18, $lt: 60 } })  // ✅ range
db.users.find().sort({ age: 1 })              // ✅ sort
```

---

### Compound Index

Index on **multiple fields** — order matters!

```js
// Index on name (asc) and age (desc)
db.users.createIndex({ name: 1, age: -1 })

// Index on status, category, price
db.products.createIndex({ status: 1, category: 1, price: -1 })
```

**Prefix Rule** — a compound index on `{ a, b, c }` supports queries on:
- `{ a }` ✅
- `{ a, b }` ✅
- `{ a, b, c }` ✅
- `{ b }` ❌ (not a prefix)
- `{ b, c }` ❌ (not a prefix)
- `{ a, c }` ⚠️ (partial — uses `a` only for index, `c` filtered in memory)

```js
// This compound index:
db.orders.createIndex({ userId: 1, status: 1, date: -1 })

// ✅ Supports these queries:
db.orders.find({ userId: "u1" })
db.orders.find({ userId: "u1", status: "active" })
db.orders.find({ userId: "u1", status: "active", date: { $gt: someDate } })

// ❌ Does NOT efficiently support:
db.orders.find({ status: "active" })        // skips prefix
db.orders.find({ date: { $gt: someDate } }) // skips prefix
```

---

### Multikey Index

Automatically created when indexing an **array field**.

```js
// Document: { name: "Alice", tags: ["mongodb", "nodejs", "backend"] }
db.posts.createIndex({ tags: 1 })

// Now supports:
db.posts.find({ tags: "mongodb" })       // ✅ single value in array
db.posts.find({ tags: { $in: ["mongodb", "nodejs"] } }) // ✅
```

> ⚠️ **Limitation:** A compound index cannot have **two** multikey (array) fields simultaneously.

```js
// ❌ INVALID — both fields are arrays
db.posts.createIndex({ tags: 1, categories: 1 })
// ERROR: "cannot index parallel arrays"
```

---

### Text Index

Enables **full-text search** on string fields.

```js
// Create text index on single field
db.articles.createIndex({ content: "text" })

// Create text index on multiple fields
db.articles.createIndex({
  title: "text",
  body: "text",
  tags: "text"
})

// Wildcard text index — all string fields
db.articles.createIndex({ "$**": "text" })
```

```js
// Search usage
db.articles.find({ $text: { $search: "mongodb aggregation" } })

// Search with negation
db.articles.find({ $text: { $search: "mongodb -sql" } })

// Exact phrase
db.articles.find({ $text: { $search: "\"aggregation pipeline\"" } })

// Sort by relevance score
db.articles.find(
  { $text: { $search: "mongodb" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

> ⚠️ **Only one text index per collection allowed.**

---

### Geospatial Index

For **location-based queries** (near, within radius, etc.)

#### 2dsphere (for real Earth coordinates — GeoJSON)

```js
// Document: { name: "Coffee Shop", location: { type: "Point", coordinates: [lng, lat] } }
db.places.createIndex({ location: "2dsphere" })

// Find places within 1000 meters of a point
db.places.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [78.4867, 17.3850] },
      $maxDistance: 1000   // meters
    }
  }
})

// Find within a polygon
db.places.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [[[lng1,lat1],[lng2,lat2],[lng3,lat3],[lng1,lat1]]]
      }
    }
  }
})
```

#### 2d (for flat/legacy coordinate pairs)

```js
db.legacy.createIndex({ coords: "2d" })
db.legacy.find({ coords: { $near: [78.48, 17.38], $maxDistance: 0.5 } })
```

---

### Hashed Index

Stores a **hash of the field value**. Used for **shard key distribution** in sharded clusters.

```js
db.users.createIndex({ userId: "hashed" })
```

> ✅ Ensures uniform data distribution across shards  
> ❌ Does NOT support range queries

---

### Wildcard Index

Indexes **all fields** or a sub-path — useful when document schema is dynamic/unknown.

```js
// Index ALL fields in collection
db.logs.createIndex({ "$**": 1 })

// Index all fields under "metadata"
db.events.createIndex({ "metadata.$**": 1 })

// Exclude specific fields
db.events.createIndex(
  { "$**": 1 },
  { wildcardProjection: { "sensitiveField": 0 } }
)
```

> ⚠️ Wildcard indexes are NOT substitutes for targeted indexes — they're larger and slower.

---

### Clustered Index

Available in **MongoDB 5.3+**. Documents are physically stored **in index order**.

```js
// Create a clustered collection
db.createCollection("iotEvents", {
  clusteredIndex: { key: { _id: 1 }, unique: true }
})
```

> ✅ Best for: time-series, IoT, insert-order access  
> ✅ Avoids a separate `_id` index (storage savings)

---

## 4. Index Properties

---

### Unique Index

Prevents **duplicate values** in the indexed field.

```js
db.users.createIndex({ email: 1 }, { unique: true })

// Unique on multiple fields combined
db.orders.createIndex({ userId: 1, orderId: 1 }, { unique: true })
```

> ⚠️ Null values are treated as a value — only one null allowed unless sparse.

---

### Sparse Index

Only indexes documents that **contain the indexed field** (skips docs where field is missing).

```js
db.users.createIndex({ phone: 1 }, { sparse: true })
```

```js
// Without sparse: null docs fill the index (wastes space)
// With sparse:    docs without 'phone' are excluded from index
```

> ⚠️ Queries that search for documents **without** the field won't use a sparse index.

---

### Partial Index

Indexes only documents that **match a filter expression** — more flexible than sparse.

```js
// Only index active users (ignore inactive)
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { status: "active" } }
)

// Only index expensive products
db.products.createIndex(
  { name: 1, price: 1 },
  { partialFilterExpression: { price: { $gt: 100 } } }
)
```

```js
// ✅ Uses partial index (matches filter)
db.users.find({ email: "x@y.com", status: "active" })

// ❌ Does NOT use index (filter not satisfied)
db.users.find({ email: "x@y.com", status: "inactive" })
```

> ✅ Smaller index = faster reads + less memory  
> ✅ Better than sparse for complex conditions

---

### TTL Index (Time-To-Live)

Automatically **deletes documents** after a specified time. Ideal for sessions, logs, caches.

```js
// Delete documents 1 hour after 'createdAt'
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }
)

// Delete at a specific expiry date stored IN the document
// Document must have: { expireAt: ISODate("2025-01-01") }
db.jobs.createIndex(
  { expireAt: 1 },
  { expireAfterSeconds: 0 }
)
```

> ⚠️ TTL background thread runs every **60 seconds** — not real-time  
> ⚠️ Only works on fields with **Date type**  
> ⚠️ Cannot be compound index

---

### Hidden Index

**Hides** the index from the query planner without dropping it. Useful for testing index removal.

```js
// Hide index (query planner ignores it)
db.users.hideIndex("email_1")

// Unhide
db.users.unhideIndex("email_1")

// Create already hidden
db.users.createIndex({ name: 1 }, { hidden: true })
```

> ✅ Use to safely test impact of dropping an index before actually dropping it

---

### Case-Insensitive Index

Uses a **collation** to ignore case differences.

```js
db.users.createIndex(
  { name: 1 },
  { collation: { locale: "en", strength: 2 } }
  //                           strength 2 = case + accent insensitive
)

// Must use same collation in query
db.users.find({ name: "alice" }).collation({ locale: "en", strength: 2 })
```

---

## 5. Default _id Index

```js
// MongoDB automatically creates this on every collection:
{ _id: 1 }  // unique, ascending

// You CANNOT drop it:
db.users.dropIndex("_id_")  // ❌ ERROR
```

> In **sharded clusters**: if `_id` is not the shard key, your app must guarantee uniqueness (use ObjectId).

---

## 6. Compound Index — Deep Dive

### Index Name

```js
// Default name: field1_dir_field2_dir
{ item: 1, quantity: -1 }  →  "item_1_quantity_-1"

// Custom name
db.orders.createIndex(
  { userId: 1, status: 1 },
  { name: "user_status_idx" }
)
```

### Sort Direction Matters

```js
// Index: { a: 1, b: 1 }
db.col.find().sort({ a: 1, b: 1 })   // ✅ uses index forward
db.col.find().sort({ a: -1, b: -1 }) // ✅ uses index backward (reversed)
db.col.find().sort({ a: 1, b: -1 })  // ❌ cannot use index — mixed directions

// Index: { a: 1, b: -1 }
db.col.find().sort({ a: 1, b: -1 })  // ✅
db.col.find().sort({ a: -1, b: 1 })  // ✅ backward
db.col.find().sort({ a: 1, b: 1 })   // ❌ mixed
```

---

## 7. ESR Rule

> **The most important compound index design rule:**  
> **E**quality → **S**ort → **R**ange

```
Index field order should follow: Equality fields FIRST, Sort fields SECOND, Range fields LAST
```

```js
// Query: find active users, sort by name, filter age > 18
db.users.find({ status: "active", age: { $gt: 18 } }).sort({ name: 1 })

// ❌ BAD index order:
db.users.createIndex({ age: 1, name: 1, status: 1 })

// ✅ GOOD index order (ESR):
db.users.createIndex({ status: 1, name: 1, age: 1 })
//                      Equality   Sort     Range
```

**Why?**
- Equality fields narrow the dataset fastest
- Sort fields allow index-backed sorting (no in-memory sort)
- Range fields go last because they create a boundary that stops prefix matching

---

## 8. Covered Queries

A query is **"covered"** when ALL fields needed are in the index — MongoDB **never touches the actual documents**.

```js
// Index:
db.users.createIndex({ name: 1, age: 1, email: 1 })

// ✅ COVERED query — all fields in index, _id excluded
db.users.find(
  { name: "Alice" },                       // query field in index
  { name: 1, age: 1, email: 1, _id: 0 }  // projected fields in index
)
```

```js
// Check with explain — look for "IXSCAN" with no "FETCH" stage
db.users.explain("executionStats").find(
  { name: "Alice" },
  { name: 1, age: 1, _id: 0 }
)
// If you see stage: "IXSCAN" without a "FETCH" stage → covered! ✅
```

> ✅ Covered queries are the **fastest possible reads** — pure index traversal, zero disk I/O for docs

---

## 9. Index Intersection

MongoDB can combine **two separate indexes** to satisfy a query.

```js
// Two separate indexes
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ amount: 1 })

// Query using both fields — MongoDB may intersect both indexes
db.orders.find({ status: "active", amount: { $gt: 100 } })
```

> ⚠️ Index intersection is **usually less efficient** than a single well-designed compound index  
> ✅ Compound index preferred in most cases

---

## 10. Query Plan & explain()

### Verbosity Levels

```js
db.users.explain()                      // queryPlanner (default)
db.users.explain("executionStats")      // + actual execution stats
db.users.explain("allPlansExecution")   // + stats for all candidates
```

### Key Fields to Look For

```js
db.users.explain("executionStats").find({ age: { $gt: 25 } })

// In output, look for:
{
  "winningPlan": {
    "stage": "FETCH",           // document fetch (index used)
    "inputStage": {
      "stage": "IXSCAN",        // ✅ index scan — GOOD
      "indexName": "age_1"
    }
  },
  "executionStats": {
    "nReturned": 150,
    "totalKeysExamined": 150,   // ✅ equals nReturned — perfect
    "totalDocsExamined": 150,
    "executionTimeMillis": 2
  }
}
```

### Warning Signs in explain()

| Stage        | Meaning                            | Action Needed?    |
|--------------|------------------------------------|-------------------|
| `COLLSCAN`   | Full collection scan — no index    | ✅ Add index       |
| `IXSCAN`     | Index scan                         | ✅ Good            |
| `FETCH`      | Fetching docs after index scan     | Usually OK        |
| `SORT`       | In-memory sort (no index for sort) | ⚠️ Add sort index  |
| `SORT_MERGE` | Merging sorted results             | ⚠️ Review index    |

```js
// Ratio to check:
// totalKeysExamined / nReturned should be close to 1
// High ratio (e.g., 1000 keys for 5 docs) = index is not selective
```

### Force an Index (hint)

```js
db.users.find({ age: 25 }).hint({ age: 1 })         // force by spec
db.users.find({ age: 25 }).hint("age_1")             // force by name
db.users.find({ age: 25 }).hint({ $natural: 1 })     // force collection scan
```

---

## 11. Index Limitations

| Limit                            | Value                        |
|----------------------------------|------------------------------|
| Max indexes per collection       | 64                           |
| Max compound index fields        | 32                           |
| Max index key size               | 1024 bytes (some versions)   |
| Max text indexes per collection  | 1                            |
| TTL index field type requirement | Date                         |
| Compound multikey restriction    | Max 1 array field per index  |

---

## 12. Index Management

### Create

```js
db.collection.createIndex(
  { field: 1 },
  {
    name: "my_index",
    unique: true,
    sparse: true,
    background: true,      // deprecated in 4.2+ (always non-blocking)
    expireAfterSeconds: 0,
    partialFilterExpression: { status: "active" },
    hidden: false,
    collation: { locale: "en", strength: 2 }
  }
)
```

### View All Indexes

```js
db.users.getIndexes()
db.users.indexStats()     // usage statistics per index
```

### Drop Indexes

```js
db.users.dropIndex("email_1")              // by name
db.users.dropIndex({ email: 1 })           // by spec
db.users.dropIndexes()                     // drop ALL (except _id)
```

### Rebuild Indexes

```js
// MongoDB 4.4+: reIndex recreates all indexes
db.users.reIndex()
```

### Index Stats (find unused indexes)

```js
// Check which indexes are being used
db.users.aggregate([{ $indexStats: {} }])

// Output includes:
// accesses.ops — number of times the index was used
// If ops = 0, the index might be safe to remove
```

---

## 13. Performance Tips & Anti-Patterns

### ✅ DO

```js
// 1. Use $match early with indexed fields
db.orders.aggregate([
  { $match: { status: "active" } },    // ← indexed field first
  { $group: { _id: "$userId", total: { $sum: "$amount" } } }
])

// 2. Apply ESR rule to compound indexes
db.users.createIndex({ status: 1, name: 1, age: 1 }) // E, S, R

// 3. Use partial indexes for selective data
db.orders.createIndex(
  { status: 1 },
  { partialFilterExpression: { status: "active" } }
)

// 4. Use covered queries — project only indexed fields
db.users.find({ name: "Alice" }, { name: 1, age: 1, _id: 0 })

// 5. Monitor with explain()
db.collection.explain("executionStats").find(query)
```

### ❌ DON'T

```js
// ❌ 1. Don't index every field
db.users.createIndex({ firstName: 1 })
db.users.createIndex({ lastName: 1 })
db.users.createIndex({ bio: 1 })        // rarely queried
db.users.createIndex({ profilePic: 1 }) // never queried

// ❌ 2. Don't use leading range in compound index
db.users.createIndex({ age: 1, status: 1 }) // age is range — put last!

// ❌ 3. Don't ignore write overhead on high-write collections
// More indexes = slower inserts/updates/deletes

// ❌ 4. Don't use $where or $regex without a prefix
db.users.find({ name: /.*alice.*/i })     // can't use index (no prefix)
db.users.find({ name: /^alice/i })        // ✅ prefix anchor — uses index

// ❌ 5. Don't create duplicate indexes
db.users.createIndex({ a: 1, b: 1 })
db.users.createIndex({ a: 1 })           // redundant — prefix of above
```

---

## 14. Real-World Examples

### 🛒 E-Commerce Product Search

```js
// Query pattern:
db.products.find({
  category: "Electronics",         // equality
  inStock: true,                   // equality
  price: { $gte: 100, $lte: 500 } // range
}).sort({ rating: -1 })            // sort

// ✅ Optimal index (ESR rule):
db.products.createIndex({
  category: 1,   // Equality
  inStock: 1,    // Equality
  rating: -1,    // Sort
  price: 1       // Range (last)
})
```

---

### 👤 User Authentication

```js
// Fast login lookup
db.users.createIndex({ email: 1 }, { unique: true })

// Find active users by email
db.users.createIndex(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" }
  }
)
```

---

### 🕐 Session / Token Expiry (TTL)

```js
// Auto-delete sessions after 24 hours
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }
)

// Insert session
db.sessions.insertOne({
  userId: "u123",
  token: "abc123",
  createdAt: new Date()
})
```

---

### 📍 Location-Based App

```js
// Create geospatial index
db.restaurants.createIndex({ location: "2dsphere" })

// Compound with geospatial + category
db.restaurants.createIndex({
  "location": "2dsphere",
  "cuisine": 1
})

// Query: nearby Indian restaurants within 2km
db.restaurants.find({
  cuisine: "Indian",
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [78.4867, 17.3850] },
      $maxDistance: 2000
    }
  }
})
```

---

### 📊 Analytics — Aggregation with Index

```js
// Index optimized for aggregation pipeline
db.orders.createIndex({ userId: 1, createdAt: -1 })

db.orders.aggregate([
  { $match: { userId: "u123" } },          // uses index
  { $sort: { createdAt: -1 } },            // uses index (no in-memory sort)
  { $limit: 10 },
  { $project: { amount: 1, status: 1 } }
])
```

---

### 🔤 Full Text Search

```js
// Create weighted text index
db.articles.createIndex(
  { title: "text", body: "text", tags: "text" },
  {
    weights: { title: 10, tags: 5, body: 1 },
    name: "article_text_index",
    default_language: "english"
  }
)

// Search with score
db.articles.find(
  { $text: { $search: "mongodb performance" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

---

## 15. Cheat Sheet

```
INDEX TYPE           COMMAND                              USE CASE
─────────────────────────────────────────────────────────────────────
Single Field       createIndex({ field: 1 })           Most queries
Compound           createIndex({ a:1, b:1, c:-1 })     Multi-field queries
Multikey           createIndex({ arrayField: 1 })      Array field queries
Text               createIndex({ field: "text" })      Full-text search
Geospatial         createIndex({ loc: "2dsphere" })    Location queries
Hashed             createIndex({ field: "hashed" })    Sharding
Wildcard           createIndex({ "$**": 1 })           Dynamic schemas

INDEX PROPERTY      OPTION                               USE CASE
─────────────────────────────────────────────────────────────────────
Unique             { unique: true }                    No duplicates
Sparse             { sparse: true }                    Skip null docs
Partial            { partialFilterExpression: {...} }  Conditional index
TTL                { expireAfterSeconds: N }           Auto-delete docs
Hidden             { hidden: true }                    Test before drop
Case Insensitive   { collation: {locale:"en", strength:2} }

DESIGN RULES
─────────────────────────────────────────────────────────────────────
ESR Rule:          Equality → Sort → Range  (compound index order)
Covered Query:     All query+project fields in index → no doc fetch
Prefix Rule:       Index {a,b,c} covers {a}, {a,b}, {a,b,c} queries
Max per collection: 64 indexes
```

---

*Guide covers MongoDB 4.4 – 7.x | Commands tested with MongoDB Community Edition*
