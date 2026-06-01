# Node.js Events: Complete Guide from Beginner to Expert

## What are Events?

event have two part
produce - emit event
consume - conumes the0 event do task

---

## Why Events Matter in Node.js

Node.js is built on an **event-driven architecture**. 

---

## Part 1: The Basics - EventEmitter

### What is EventEmitter?

`EventEmitter` is the foundation of events in Node.js. It's a class that lets objects:
1. **Emit** (trigger/fire) named events
2. **Listen** for those events and respond

### Your First EventEmitter

```javascript
// Step 1: Import the events module
const EventEmitter = require('node:events');

// Step 2: Create an emitter (or extend it)
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// Step 3: Register a listener (what to do when event happens)
myEmitter.on('greet', () => {
  console.log('Someone said hello!');
});

// Step 4: Emit the event (trigger it)
myEmitter.emit('greet');
// Output: Someone said hello!
```

### Breaking It Down

| Term | Meaning | Analogy |
|------|---------|---------|
| **EventEmitter** | Object that can emit and listen to events | A radio station |
| **Event** | A named signal that something happened | A specific radio frequency |
| **Listener** | A function that runs when event occurs | Your radio tuned to that frequency |
| **emit()** | Triggers the event | Broadcasting a message |
| **on()** | Registers a listener | Tuning your radio to listen |

---

## Part 2: Passing Data with Events

Events can carry information, like passing notes with your notification.

```javascript
const EventEmitter = require('node:events');

class OrderSystem extends EventEmitter {}
const orders = new OrderSystem();

// Listener receives the data passed with emit
orders.on('newOrder', (orderId, customerName, amount) => {
  console.log(`Order #${orderId}`);
  console.log(`Customer: ${customerName}`);
  console.log(`Amount: $${amount}`);
});

// Emit with data (arguments after event name)
orders.emit('newOrder', 101, 'John Doe', 59.99);

// Output:
// Order #101
// Customer: John Doe
// Amount: $59.99
```

---

## Part 3: The `this` Keyword in Listeners

### Regular Functions vs Arrow Functions

This is important! The `this` keyword behaves differently:

```javascript
const EventEmitter = require('node:events');

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    this.name = 'MyEmitter Instance';
  }
}

const myEmitter = new MyEmitter();

// REGULAR FUNCTION: `this` refers to the EventEmitter
myEmitter.on('event', function() {
  console.log('Regular function this:', this.name);
  // Output: MyEmitter Instance ✓
});

// ARROW FUNCTION: `this` refers to outer scope (not EventEmitter)
myEmitter.on('event', () => {
  console.log('Arrow function this:', this.name);
  // Output: undefined ✗
});

myEmitter.emit('event');
```

**Rule of thumb:** Use regular functions when you need access to the emitter via `this`.

---

## Part 4: One-Time Listeners with `.once()`

Sometimes you only want to respond to an event **one time**.

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

// This listener runs EVERY time
myEmitter.on('ping', () => {
  console.log('ping - I run every time');
});

// This listener runs ONLY ONCE, then removes itself
myEmitter.once('ping', () => {
  console.log('ping - I run only once!');
});

myEmitter.emit('ping');
// Output:
// ping - I run every time
// ping - I run only once!

myEmitter.emit('ping');
// Output:
// ping - I run every time
// (the once listener is gone)

myEmitter.emit('ping');
// Output:
// ping - I run every time
```

### When to Use `.once()`

- Initial setup or configuration
- First-time connections
- One-time notifications
- Cleanup operations

---

## Part 5: Synchronous Execution

**Important:** Listeners are called **synchronously** (one after another, in order).

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

myEmitter.on('event', () => console.log('First'));
myEmitter.on('event', () => console.log('Second'));
myEmitter.on('event', () => console.log('Third'));

console.log('Before emit');
myEmitter.emit('event');
console.log('After emit');

// Output:
// Before emit
// First
// Second
// Third
// After emit
```

### Making Listeners Asynchronous

If you need async behavior, use `setImmediate()` or `process.nextTick()`:

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

myEmitter.on('event', () => {
  setImmediate(() => {
    console.log('This happens asynchronously');
  });
});

console.log('Before emit');
myEmitter.emit('event');
console.log('After emit');

// Output:
// Before emit
// After emit
// This happens asynchronously
```

---

## Part 6: Error Handling (Critical!)

### The Special 'error' Event

Node.js treats `'error'` events specially. If you emit an error and **no listener exists**, Node.js will **crash**.

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

// ⚠️ DANGER: No error listener!
myEmitter.emit('error', new Error('Something broke!'));
// 💥 Node.js crashes with unhandled error!
```

### Always Add Error Listeners

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

// ✅ SAFE: Error listener exists
myEmitter.on('error', (err) => {
  console.error('Caught error:', err.message);
});

myEmitter.emit('error', new Error('Something broke!'));
// Output: Caught error: Something broke!
// Node.js continues running ✓
```

### Monitoring Errors Without Handling

Use `errorMonitor` to log errors without preventing crashes:

```javascript
const { EventEmitter, errorMonitor } = require('node:events');
const myEmitter = new EventEmitter();

// This logs the error but doesn't "handle" it
myEmitter.on(errorMonitor, (err) => {
  console.log('Error detected:', err.message);
  // Send to monitoring service
});

// Still need a real handler to prevent crash
myEmitter.on('error', (err) => {
  console.error('Handled:', err.message);
});
```

---

## Part 7: All EventEmitter Methods

### Adding Listeners

| Method | Description |
|--------|-------------|
| `.on(event, listener)` | Add listener to end of array |
| `.addListener(event, listener)` | Same as `.on()` |
| `.once(event, listener)` | Add one-time listener to end |
| `.prependListener(event, listener)` | Add listener to **beginning** |
| `.prependOnceListener(event, listener)` | Add one-time listener to beginning |

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

myEmitter.on('greet', () => console.log('Third'));
myEmitter.prependListener('greet', () => console.log('Second'));
myEmitter.prependListener('greet', () => console.log('First'));

myEmitter.emit('greet');
// Output:
// First
// Second
// Third
```

### Removing Listeners

| Method | Description |
|--------|-------------|
| `.off(event, listener)` | Remove specific listener |
| `.removeListener(event, listener)` | Same as `.off()` |
| `.removeAllListeners([event])` | Remove all listeners (optionally for specific event) |

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

function greetHandler() {
  console.log('Hello!');
}

myEmitter.on('greet', greetHandler);
myEmitter.emit('greet'); // Output: Hello!

myEmitter.off('greet', greetHandler);
myEmitter.emit('greet'); // No output - listener removed
```

### Inspecting Listeners

| Method | Description |
|--------|-------------|
| `.listeners(event)` | Get array of listeners for event |
| `.rawListeners(event)` | Get listeners including wrappers |
| `.listenerCount(event)` | Count listeners for event |
| `.eventNames()` | Get all event names with listeners |

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

myEmitter.on('foo', () => {});
myEmitter.on('foo', () => {});
myEmitter.on('bar', () => {});

console.log(myEmitter.eventNames());     // ['foo', 'bar']
console.log(myEmitter.listenerCount('foo')); // 2
console.log(myEmitter.listeners('foo')); // [Function, Function]
```

---

## Part 8: Max Listeners Warning

By default, Node.js warns you if you add more than **10 listeners** to a single event (possible memory leak).

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

// Add 11 listeners
for (let i = 0; i < 11; i++) {
  myEmitter.on('event', () => {});
}
// Warning: Possible EventEmitter memory leak detected.
// 11 event listeners added to [EventEmitter].
```

### Changing the Limit

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

// For this specific emitter
myEmitter.setMaxListeners(20);
console.log(myEmitter.getMaxListeners()); // 20

// For ALL emitters (global default)
const events = require('node:events');
events.defaultMaxListeners = 20;

// Unlimited listeners
myEmitter.setMaxListeners(0); // or Infinity
```

---

## Part 9: Special Events

### 'newListener' Event

Fired **before** a listener is added:

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

myEmitter.on('newListener', (eventName, listener) => {
  console.log(`Adding listener for: ${eventName}`);
});

myEmitter.on('greet', () => console.log('Hello'));
// Output: Adding listener for: greet
```

### 'removeListener' Event

Fired **after** a listener is removed:

```javascript
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

myEmitter.on('removeListener', (eventName, listener) => {
  console.log(`Removed listener for: ${eventName}`);
});

function handler() {}
myEmitter.on('greet', handler);
myEmitter.off('greet', handler);
// Output: Removed listener for: greet
```

---

## Part 10: Async/Await with Events

### Using `events.once()` with Promises

```javascript
const { once, EventEmitter } = require('node:events');

async function main() {
  const emitter = new EventEmitter();
  
  // Schedule event to emit later
  setTimeout(() => {
    emitter.emit('ready', 'data loaded');
  }, 1000);
  
  // Wait for the event (returns array of arguments)
  const [result] = await once(emitter, 'ready');
  console.log(result); // 'data loaded'
}

main();
```

### Using `events.on()` for Async Iteration

```javascript
const { on, EventEmitter } = require('node:events');

async function main() {
  const emitter = new EventEmitter();
  
  // Emit events later
  setTimeout(() => {
    emitter.emit('data', { id: 1 });
    emitter.emit('data', { id: 2 });
    emitter.emit('data', { id: 3 });
  }, 100);
  
  // Iterate over events as they come
  for await (const [event] of on(emitter, 'data')) {
    console.log('Received:', event);
    if (event.id === 3) break;
  }
}

main();
```

### Cancelling with AbortController

```javascript
const { once, EventEmitter } = require('node:events');

async function main() {
  const emitter = new EventEmitter();
  const ac = new AbortController();
  
  // Cancel after 1 second
  setTimeout(() => ac.abort(), 1000);
  
  try {
    // Wait for event that might never come
    await once(emitter, 'data', { signal: ac.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Waiting was cancelled!');
    }
  }
}

main();
```

---

## Part 11: Capturing Promise Rejections

When using async listeners, errors can be lost. Use `captureRejections`:

```javascript
const EventEmitter = require('node:events');

// Enable capture rejections
const emitter = new EventEmitter({ captureRejections: true });

// Async listener that throws
emitter.on('process', async () => {
  throw new Error('Async error!');
});

// This catches the async error
emitter.on('error', (err) => {
  console.error('Caught:', err.message);
});

emitter.emit('process');
// Output: Caught: Async error!
```

### Global Setting

```javascript
const events = require('node:events');
events.captureRejections = true; // All new emitters will capture
```

---

## Part 12: EventTarget (Web-Compatible API)

Node.js also supports the browser-standard `EventTarget`:

```javascript
const target = new EventTarget();

target.addEventListener('click', (event) => {
  console.log('Clicked!', event.type);
});

target.dispatchEvent(new Event('click'));
// Output: Clicked! click
```

### EventTarget vs EventEmitter

| Feature | EventEmitter | EventTarget |
|---------|--------------|-------------|
| Node.js specific | ✅ | ❌ (Web standard) |
| Multiple same listeners | ✅ Allowed | ❌ Ignored |
| Listener order methods | ✅ `prepend*` | ❌ Not available |
| `'error'` special handling | ✅ Yes | ❌ No |
| Return value from `.emit()` | ✅ Boolean | ❌ No |

---

## Part 13: Real-World Examples

### Example 1: File Download System

```javascript
const EventEmitter = require('node:events');

class FileDownloader extends EventEmitter {
  download(url) {
    this.emit('start', url);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      this.emit('progress', progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        this.emit('complete', { url, size: '5.2MB' });
      }
    }, 500);
  }
}

const downloader = new FileDownloader();

downloader.on('start', (url) => console.log(`Starting download: ${url}`));
downloader.on('progress', (percent) => console.log(`Progress: ${percent}%`));
downloader.on('complete', (info) => console.log(`Done! Size: ${info.size}`));
downloader.on('error', (err) => console.error(`Failed: ${err.message}`));

downloader.download('https://example.com/file.zip');
```

### Example 2: Chat Room

```javascript
const EventEmitter = require('node:events');

class ChatRoom extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.users = new Set();
  }
  
  join(username) {
    this.users.add(username);
    this.emit('userJoined', username);
  }
  
  leave(username) {
    this.users.delete(username);
    this.emit('userLeft', username);
  }
  
  sendMessage(username, message) {
    this.emit('message', { from: username, text: message, time: new Date() });
  }
}

const room = new ChatRoom('General');

room.on('userJoined', (user) => console.log(`📢 ${user} joined the room`));
room.on('userLeft', (user) => console.log(`📢 ${user} left the room`));
room.on('message', (msg) => console.log(`💬 ${msg.from}: ${msg.text}`));

room.join('Alice');
room.join('Bob');
room.sendMessage('Alice', 'Hello everyone!');
room.sendMessage('Bob', 'Hi Alice!');
room.leave('Alice');
```

### Example 3: Order Processing Pipeline

```javascript
const EventEmitter = require('node:events');

class OrderProcessor extends EventEmitter {
  processOrder(order) {
    this.emit('received', order);
    
    setTimeout(() => {
      if (!order.paymentValid) {
        this.emit('error', new Error('Payment failed'));
        return;
      }
      this.emit('validated', order);
      
      setTimeout(() => {
        this.emit('shipped', { ...order, trackingNumber: 'TRK123' });
      }, 1000);
    }, 1000);
  }
}

const processor = new OrderProcessor();

processor.on('received', (order) => 
  console.log(`📦 Order ${order.id} received`));

processor.on('validated', (order) => 
  console.log(`✅ Order ${order.id} validated`));

processor.on('shipped', (order) => 
  console.log(`🚚 Order ${order.id} shipped! Tracking: ${order.trackingNumber}`));

processor.on('error', (err) => 
  console.error(`❌ Error: ${err.message}`));

// Process orders
processor.processOrder({ id: 1, item: 'Laptop', paymentValid: true });
processor.processOrder({ id: 2, item: 'Phone', paymentValid: false });
```

---

## Part 14: Best Practices

### ✅ DO

```javascript
// 1. Always handle errors
emitter.on('error', handleError);

// 2. Remove listeners when done (prevent memory leaks)
function cleanup() {
  emitter.off('data', handleData);
}

// 3. Use descriptive event names
emitter.emit('user:login', userData);      // Good
emitter.emit('orderStatusUpdated', order); // Good

// 4. Document your events
/**
 * @fires MyClass#data - When new data arrives
 * @fires MyClass#error - When an error occurs
 */

// 5. Use once() for one-time setup
server.once('ready', startAcceptingConnections);
```

### ❌ DON'T

```javascript
// 1. Don't forget to remove listeners
// Bad: Memory leak in long-running apps
element.on('scroll', handler); // Never removed!

// 2. Don't ignore the max listeners warning
// It usually indicates a real problem

// 3. Don't use arrow functions if you need `this`
emitter.on('event', () => {
  this.something; // `this` is wrong!
});

// 4. Don't emit errors without listeners
emitter.emit('error', new Error()); // Crash if no listener!
```

---

## Quick Reference Cheat Sheet

```javascript
const EventEmitter = require('node:events');
const emitter = new EventEmitter();

// ADDING LISTENERS
emitter.on('event', handler);           // Add listener
emitter.once('event', handler);         // Add one-time listener
emitter.prependListener('event', handler); // Add to beginning
emitter.addListener('event', handler);  // Alias for .on()

// REMOVING LISTENERS
emitter.off('event', handler);          // Remove specific
emitter.removeListener('event', handler); // Alias for .off()
emitter.removeAllListeners('event');    // Remove all for event
emitter.removeAllListeners();           // Remove ALL listeners

// EMITTING
emitter.emit('event');                  // Trigger event
emitter.emit('event', arg1, arg2);      // With arguments
const hadListeners = emitter.emit('event'); // Returns boolean

// INSPECTING
emitter.eventNames();                   // All event names
emitter.listenerCount('event');         // Count for event
emitter.listeners('event');             // Array of listeners
emitter.rawListeners('event');          // With wrappers

// MAX LISTENERS
emitter.setMaxListeners(20);            // Set limit
emitter.getMaxListeners();              // Get limit

// ASYNC UTILITIES
const { once, on } = require('node:events');
await once(emitter, 'event');           // Wait for single event
for await (const e of on(emitter, 'event')) {} // Iterate events
```

---

## Summary

Events are the backbone of Node.js. They enable:

- **Loose coupling** - Emitters don't need to know about listeners
- **Async patterns** - Respond to things when they happen
- **Scalability** - Handle many concurrent operations
- **Clean code** - Separate concerns elegantly

Master events, and you've mastered a fundamental Node.js concept! 🚀