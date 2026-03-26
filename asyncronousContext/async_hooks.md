# Node.js Asynchronous Context Tracking — Beginner to Expert Interview Guide

---

## 🟢 BEGINNER LEVEL

### What is Asynchronous Context?

When Node.js handles multiple tasks at the same time (like 100 users hitting your server), each task runs asynchronously. **Asynchronous context** is the ability to track *which data belongs to which task* — even as the code jumps around through callbacks, promises, and timers.

Think of it like a **hospital wristband**. Every patient (request) gets a wristband (context) and no matter which doctor (callback) sees them, the wristband always identifies who they are.

### What problem does it solve?

```javascript
// ❌ Without context tracking — WHO made this request?
app.get('/user', async (req, res) => {
  await getFromDB();
  logger.log("fetched data"); // Which user's data? No idea!
});

// ✅ With context tracking — we always know
app.get('/user', async (req, res) => {
  storage.run({ userId: req.user.id }, async () => {
    await getFromDB();
    logger.log(`fetched data for ${storage.getStore().userId}`); // Always correct!
  });
});
```

---

## 🟡 INTERMEDIATE LEVEL

### Class: `AsyncLocalStorage` — The Core Tool

This is the **primary** class for async context tracking. It lives in `node:async_hooks`.

```javascript
const { AsyncLocalStorage } = require('node:async_hooks');
const storage = new AsyncLocalStorage();
```

Think of `AsyncLocalStorage` as a **safe that automatically travels with your async chain** — every `setTimeout`, `Promise`, `await` inside a `run()` call can access the same safe.

#### The 4 Methods You Must Know

**1. `.run(store, callback)` — Start a context bubble**
```javascript
storage.run({ userId: 42, role: 'admin' }, () => {
  // Everything inside here (and any async ops spawned here)
  // can access this store
  setTimeout(() => {
    console.log(storage.getStore()); // { userId: 42, role: 'admin' } ✅
  }, 1000);
});

console.log(storage.getStore()); // undefined — outside the bubble ✅
```

**2. `.getStore()` — Read the current context**
```javascript
function logWithContext(message) {
  const store = storage.getStore();
  const userId = store?.userId ?? 'anonymous';
  console.log(`[User: ${userId}] ${message}`);
}
```

**3. `.enterWith(store)` — Permanently enter a context (use carefully!)**
```javascript
// ⚠️ Affects ALL subsequent code in this execution, not just a callback
storage.enterWith({ userId: 99 });
storage.getStore(); // { userId: 99 }
```
> **Interview tip:** Always prefer `.run()` over `.enterWith()`. The doc warns that `enterWith()` bleeds into subsequent event handlers, which can cause bugs.

**4. `.exit(callback)` — Temporarily escape the context**
```javascript
storage.run({ userId: 42 }, () => {
  storage.exit(() => {
    console.log(storage.getStore()); // undefined — escaped the bubble
  });
  console.log(storage.getStore()); // { userId: 42 } — back to normal
});
```

#### Real-World Example — Request Logger (from the docs)

```javascript
const http = require('node:http');
const { AsyncLocalStorage } = require('node:async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

function logWithId(msg) {
  const id = asyncLocalStorage.getStore();
  console.log(`${id !== undefined ? id : '-'}:`, msg);
}

let idSeq = 0;
http.createServer((req, res) => {
  asyncLocalStorage.run(idSeq++, () => {  // Each request gets its own ID
    logWithId('start');
    setImmediate(() => {
      logWithId('finish'); // Still knows its ID, even after setImmediate!
      res.end();
    });
  });
}).listen(8080);
// Output:
// 0: start
// 0: finish
// 1: start
// 1: finish
```

---

## 🔴 ADVANCED LEVEL

### Class: `AsyncResource` — Manual Context Control

While `AsyncLocalStorage` handles context *automatically*, `AsyncResource` gives you **manual control** for custom async operations — like your own worker pools, database connection pools, or event emitters.

**Core idea:** When you create an `AsyncResource`, it **captures the current async context** at that moment. Later, you can re-enter that context using `.runInAsyncScope()`.

```javascript
const { AsyncResource } = require('node:async_hooks');

class DBQuery extends AsyncResource {
  constructor(db) {
    super('DBQuery'); // Give it a name/type
    this.db = db;
  }

  getInfo(query, callback) {
    this.db.get(query, (err, data) => {
      // Without this, the callback loses its original context
      this.runInAsyncScope(callback, null, err, data); // ✅ Context restored
    });
  }
}
```

### `AsyncResource` vs `AsyncLocalStorage` — When to use which?

| Scenario | Use |
|---|---|
| Web request tracking, logging, tracing | `AsyncLocalStorage` |
| Custom worker pools, DB pools | `AsyncResource` |
| Simple context snapshot | `AsyncLocalStorage.snapshot()` |
| Binding a single function to context | `AsyncResource.bind()` |

### `AsyncLocalStorage.snapshot()` — Modern Shortcut

Captures context at one point, lets you restore it later — a cleaner replacement for `AsyncResource` in many cases:

```javascript
class RequestHandler {
  // Snapshot is taken when this object is CREATED (inside a run() call)
  #runInScope = AsyncLocalStorage.snapshot();

  process() {
    // Even if called later from a different context, uses the original
    return this.#runInScope(() => storage.getStore());
  }
}

const handler = storage.run({ userId: 5 }, () => new RequestHandler());
storage.run({ userId: 999 }, () => {
  console.log(handler.process()); // { userId: 5 } — original context wins!
});
```

### Worker Thread Pool with `AsyncResource` (Expert Pattern)

The full pattern from the docs solves a real problem: when a Worker finishes, its callback runs in the *Worker's* context, not the *original caller's* context. `AsyncResource` fixes this:

```javascript
class WorkerPoolTaskInfo extends AsyncResource {
  constructor(callback) {
    super('WorkerPoolTaskInfo');
    this.callback = callback; // Captures caller's context at task creation time
  }

  done(err, result) {
    // Runs callback in the ORIGINAL caller's context, not the worker's context
    this.runInAsyncScope(this.callback, null, err, result);
    this.emitDestroy(); // Clean up — call once only!
  }
}
```

---

## 🎯 Interview Cheat Sheet

| Question | Answer |
|---|---|
| What is async context? | Data that travels with an async operation chain |
| Main class for tracking? | `AsyncLocalStorage` from `node:async_hooks` |
| `.run()` vs `.enterWith()`? | `run()` is scoped/safe; `enterWith()` bleeds into whole execution |
| What causes context loss? | Old callback-based APIs that don't propagate async IDs |
| How to fix context loss? | Wrap callbacks with `util.promisify()` or use `AsyncResource` |
| When to use `AsyncResource`? | Custom pools, event emitters, anything not natively async-tracked |
| Is `AsyncLocalStorage` stable? | Yes — Stability 2 (Stable) |

---

## 🧭 Learning Roadmap

```
Week 1: Master async/await + Promises
Week 2: Build a simple HTTP server, add AsyncLocalStorage for request IDs
Week 3: Experiment with context loss — break it and fix it
Week 4: Implement a mini worker pool using AsyncResource
```

Want me to build you a **runnable practice project** that covers all of this end-to-end?


----
----
----
----



# Asynchronous Context Tracking in Node.js

A comprehensive guide from beginner to expert level for interview preparation.

---

## 🟢 Beginner Level

### What is Asynchronous Context?

**Definition:** Asynchronous context is a way to store and propagate data throughout asynchronous operations (callbacks, promises, async/await) without explicitly passing that data through every function call.

**Simple Analogy:** Think of it like a "thread-local storage" in other languages, or like a "backpack" that follows your code around, even when it jumps between different async operations.

### Why Do We Need It?

```javascript
// Problem: How do we know which request this log belongs to?
app.get('/user', async (req, res) => {
  const userId = req.params.id;
  
  // Later, deep in some utility function...
  console.log('Fetching data...'); // Which request triggered this?
  
  const data = await fetchData();
  res.send(data);
});
```

Without async context, you'd have to pass `requestId` through every single function call. With async context, it "magically" follows your code.

### Basic Example

```javascript
const { AsyncLocalStorage } = require('node:async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

// Store data
asyncLocalStorage.run({ userId: 123 }, () => {
  // Retrieve data anywhere inside this callback
  console.log(asyncLocalStorage.getStore()); // { userId: 123 }
  
  setTimeout(() => {
    // Still accessible in async operations!
    console.log(asyncLocalStorage.getStore()); // { userId: 123 }
  }, 1000);
});
```

---

## 🟡 Intermediate Level

### Core Concepts

#### 1. AsyncLocalStorage

The primary class for managing async context. It maintains **independent storage contexts** that persist through:
- Callbacks
- Promises
- async/await
- Timers (setTimeout, setInterval)
- I/O operations

#### 2. Key Methods

| Method | Purpose |
|--------|---------|
| `run(store, callback)` | Execute callback with a specific store |
| `getStore()` | Retrieve the current store value |
| `enterWith(store)` | Set store for current and future async operations |
| `exit(callback)` | Run callback outside the current context |

### Practical Example: Request Logging

```javascript
const http = require('node:http');
const { AsyncLocalStorage } = require('node:async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

// Logger that automatically includes request ID
function log(message) {
  const store = asyncLocalStorage.getStore();
  const requestId = store?.requestId || 'NO-CONTEXT';
  console.log(`[${requestId}] ${message}`);
}

// Simulate database call
async function fetchUserFromDB(id) {
  log('Fetching user from database...');
  return { id, name: 'John' };
}

// Simulate service call
async function getUserDetails(id) {
  log('Getting user details...');
  const user = await fetchUserFromDB(id);
  log('User fetched successfully');
  return user;
}

let requestCounter = 0;

http.createServer(async (req, res) => {
  const requestId = `REQ-${++requestCounter}`;
  
  await asyncLocalStorage.run({ requestId }, async () => {
    log('Request started');
    
    const user = await getUserDetails(1);
    
    log('Request completed');
    res.end(JSON.stringify(user));
  });
}).listen(3000);
```

**Output:**
```
[REQ-1] Request started
[REQ-1] Getting user details...
[REQ-1] Fetching user from database...
[REQ-1] User fetched successfully
[REQ-1] Request completed
```

### run() vs enterWith()

```javascript
// run() - Scoped, preferred approach
asyncLocalStorage.run({ id: 1 }, () => {
  console.log(asyncLocalStorage.getStore()); // { id: 1 }
});
console.log(asyncLocalStorage.getStore()); // undefined

// enterWith() - Persists beyond the current scope (use carefully!)
asyncLocalStorage.enterWith({ id: 2 });
console.log(asyncLocalStorage.getStore()); // { id: 2 }
// Context persists for all future async operations in this execution
```

**Interview Tip:** Always prefer `run()` over `enterWith()` because it provides better scoping and is less error-prone.

---

## 🟠 Advanced Level

### AsyncLocalStorage.snapshot()

Captures the current execution context for later use:

```javascript
const asyncLocalStorage = new AsyncLocalStorage();

const capturedContext = asyncLocalStorage.run({ user: 'Alice' }, () => {
  // Capture this context
  return AsyncLocalStorage.snapshot();
});

// Later, in a different context
asyncLocalStorage.run({ user: 'Bob' }, () => {
  console.log(asyncLocalStorage.getStore()); // { user: 'Bob' }
  
  // Run with the captured context
  const result = capturedContext(() => {
    return asyncLocalStorage.getStore(); // { user: 'Alice' }
  });
  
  console.log(result); // { user: 'Alice' }
});
```

### AsyncLocalStorage.bind()

Binds a function to the current execution context:

```javascript
const asyncLocalStorage = new AsyncLocalStorage();

let boundFunction;

asyncLocalStorage.run({ theme: 'dark' }, () => {
  boundFunction = AsyncLocalStorage.bind(() => {
    return asyncLocalStorage.getStore();
  });
});

// Call from different context
asyncLocalStorage.run({ theme: 'light' }, () => {
  console.log(boundFunction()); // { theme: 'dark' } - original context!
});
```

### Context Loss and Troubleshooting

Context can be lost in certain situations:

```javascript
// ❌ Context loss with custom thenables
const customThenable = {
  then(resolve) {
    // Context might be lost here
    setTimeout(resolve, 100);
  }
};

// ✅ Fix: Use util.promisify() or AsyncResource
const { promisify } = require('util');
```

**Common causes of context loss:**
- Custom thenable implementations
- Native addons that don't propagate context
- Some third-party libraries

---

## 🔴 Expert Level

### AsyncResource Class

For lower-level control when embedding custom async resources:

```javascript
const { AsyncResource, executionAsyncId } = require('node:async_hooks');

class DatabaseConnection extends AsyncResource {
  constructor() {
    super('DatabaseConnection');
    this.connection = null;
  }

  async query(sql, callback) {
    // Ensure callback runs in the correct async context
    this.runInAsyncScope(callback, null, await this.executeQuery(sql));
  }

  executeQuery(sql) {
    return new Promise(resolve => {
      setTimeout(() => resolve({ rows: [] }), 100);
    });
  }

  close() {
    this.connection = null;
    this.emitDestroy(); // Trigger destroy hooks
  }
}
```

### Worker Thread Pool with Proper Context Tracking

```javascript
const { AsyncResource } = require('node:async_hooks');
const { Worker } = require('node:worker_threads');

class WorkerPoolTaskInfo extends AsyncResource {
  constructor(callback) {
    super('WorkerPoolTaskInfo');
    this.callback = callback;
  }

  done(err, result) {
    // Execute callback in the original async context
    this.runInAsyncScope(this.callback, null, err, result);
    this.emitDestroy();
  }
}

class WorkerPool {
  runTask(task, callback) {
    const worker = this.getWorker();
    
    // Wrap callback to preserve async context
    worker.taskInfo = new WorkerPoolTaskInfo(callback);
    worker.postMessage(task);
  }
}
```

### Integrating with EventEmitter

```javascript
const { AsyncResource } = require('node:async_hooks');
const { EventEmitter } = require('node:events');

const emitter = new EventEmitter();

asyncLocalStorage.run({ requestId: 'ABC' }, () => {
  // ✅ Bind to current context
  emitter.on('data', AsyncResource.bind((data) => {
    console.log(asyncLocalStorage.getStore()); // { requestId: 'ABC' }
  }));
});

// Emit from different context
asyncLocalStorage.run({ requestId: 'XYZ' }, () => {
  emitter.emit('data', { value: 42 });
  // Handler still has access to 'ABC' context!
});
```

### Performance Considerations

```javascript
// Multiple independent instances don't interfere
const userContext = new AsyncLocalStorage();
const requestContext = new AsyncLocalStorage();
const traceContext = new AsyncLocalStorage();

// Each maintains its own context independently
userContext.run({ userId: 1 }, () => {
  requestContext.run({ requestId: 'REQ-1' }, () => {
    traceContext.run({ traceId: 'TRACE-1' }, () => {
      console.log(userContext.getStore());    // { userId: 1 }
      console.log(requestContext.getStore()); // { requestId: 'REQ-1' }
      console.log(traceContext.getStore());   // { traceId: 'TRACE-1' }
    });
  });
});
```

---

## 📝 Interview Questions & Answers

### Beginner

**Q: What is AsyncLocalStorage?**
> A: AsyncLocalStorage is a class that creates stores which stay coherent through asynchronous operations. It allows you to store data that automatically propagates through callbacks, promises, and async/await without explicitly passing it.

**Q: Why would you use AsyncLocalStorage instead of global variables?**
> A: Global variables are shared across all requests/operations, causing race conditions in concurrent scenarios. AsyncLocalStorage provides isolated context per async operation chain, making it safe for concurrent use.

### Intermediate

**Q: What's the difference between `run()` and `enterWith()`?**
> A: `run()` executes a callback with a scoped context that ends when the callback completes. `enterWith()` sets the context for the current execution and all subsequent async operations, making it harder to control and potentially causing context leaks.

**Q: How would you handle context loss?**
> A: 
> 1. Use `util.promisify()` for callback-based APIs
> 2. Use `AsyncResource.bind()` for event handlers
> 3. Debug by logging `getStore()` to find where context is lost

### Advanced

**Q: When would you use AsyncResource instead of AsyncLocalStorage?**
> A: Use AsyncResource when you need:
> - Fine-grained control over async lifecycle hooks
> - To integrate with custom resource pools (database connections, worker threads)
> - To properly associate callbacks with their originating async context in event-driven code

**Q: How does AsyncLocalStorage work under the hood?**
> A: It uses Node.js's async_hooks module to track async operations. When an async operation is created, the current context is captured and associated with that operation's async ID. When the operation's callback runs, the context is restored.

---

## 🎯 Key Takeaways

1. **AsyncLocalStorage** is the go-to solution for request-scoped data in Node.js
2. Always prefer **`run()`** over **`enterWith()`**
3. Use **`AsyncResource.bind()`** when working with EventEmitters
4. **Context loss** can occur with custom thenables and some native addons
5. Multiple AsyncLocalStorage instances are **independent and safe** to use simultaneously
6. It's similar to **thread-local storage** in other languages but designed for Node.js's async model