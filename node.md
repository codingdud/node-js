what is node.js?
open-source crose-platform
node.js is js runtime env for excuting js code.
it provide async i/o funtionality
it is single thread


## JavaScript Fundamentals — Quick Reference

### Core Concepts

| Topic | Definition |
|---|---|
| **Lexical Structure** | The basic rules of how JavaScript code is written — syntax, keywords, whitespace, and how the interpreter reads characters. |
| **Expressions** | Any valid unit of code that resolves to a value (e.g., `5 + 3`, `"hello"`, `x > 2`). |
| **Data Types** | The categories of values in JS: `String`, `Number`, `Boolean`, `null`, `undefined`, `Symbol`, `BigInt`, and `Object`. |
| **Classes** | Blueprints for creating objects using `class` syntax, encapsulating data and behavior together. |
| **Variables** | Named containers for storing values, declared using `var`, `let`, or `const`. |
| **Functions** | Reusable blocks of code that perform a task and optionally return a value. |
| **`this` Operator** | A keyword referring to the object that is currently executing the code — its value depends on the call context. |
| **Arrow Functions** | A concise function syntax (`=>`) that does **not** bind its own `this`, inheriting it from the surrounding scope. |
| **Loops** | Structures that repeat a block of code (`for`, `while`, `for...of`, etc.) until a condition is met. |
| **Scopes** | The accessibility of variables — **global** (everywhere), **function** (inside a function), or **block** (inside `{}`). |
| **Arrays** | Ordered, indexed collections of values stored in a single variable: `[1, 2, 3]`. |
| **Template Literals** | String syntax using backticks (`` ` ``) that supports embedded expressions: `` `Hello, ${name}!` ``. |
| **Strict Mode** | Opt-in mode (`"use strict"`) that enforces cleaner code by catching silent errors and restricting unsafe features. |
| **ES6 and Beyond** | Modern JavaScript enhancements — destructuring, spread/rest, modules, optional chaining, and more — introduced from 2015 onward. |

---

### Asynchronous Programming

| Topic | Definition |
|---|---|
| **Callbacks** | Functions passed as arguments to another function, executed once an async operation completes. |
| **Timers** | Built-in functions (`setTimeout`, `setInterval`) that schedule code execution after a delay or at repeated intervals. |
| **Promises** | Objects representing the eventual result of an async operation — can be `pending`, `fulfilled`, or `rejected`. |
| **Async / Await** | Syntactic sugar over Promises that lets you write async code in a clean, synchronous-looking style. |
| **Closures** | A function that retains access to its outer scope's variables even after the outer function has finished executing. |
| **Event Loop** | The mechanism that allows Node.js to handle non-blocking I/O by continuously checking the call stack and callback queue, executing tasks one at a time. |

# V8 
v8 is the JavaScript engine i.e. it parses and executes JavaScript code. The DOM, and the other Web Platform APIs (they all makeup runtime environment) are provided by the browser.

# npm - node package manager(4,18,2) major, minor ,patch
 installing , updating,  manage download dependenies, versioning, in package.json
 --save -S add entri to dependence
 --save-dev -D add entri to devdependence
 --save-optional -O  add entri to optionaldependence
 --no-save installs but does not add the entry to the package.json file dependencies
 -g globale

 npm outdated
 npm list --depth=0
```json
"express": "^4.18.2"   // ^ = minor + patch OK (most common)
"mongoose": "~7.6.3"  // ~ = only patch OK
"lodash": "4.17.21"   // exact version only
```
## package.json  Contains name, version, dependencies, scripts, configuration.
### `name`
Project name. Must be lowercase, no spaces. Hyphens OK.
### `version`
Follows SemVer (MAJOR.MINOR.PATCH). Start at `1.0.0`.
### `description`
Short explanation. Shows in npm search.
### `main`
Entry point file. The file that runs when you start the app.
### `type`
`"module"` → ES Modules | `"commonjs"` (default) → CommonJS
### `scripts` — Very Important!
### `dependencies`
Packages needed to RUN the app. Installed in production too.
### `devDependencies`
Packages needed ONLY during development. NOT installed in production.
### `engines`
Specifies required Node.js version.
### `keywords`, `author`, `license`
Metadata. `MIT` is most common license.


## package-lock.json
Locks EXACT versions of every package. Ensures everyone gets same versions.
> **Rule:** ALWAYS commit `package-lock.json` to Git. NEVER delete it.

# run task
 in package.json we can specify cli task that can be run using `npm run task-nale` in script object
# initializing project template code

 # debug Node.js code - debuger;
 ### node inspect index.js
  use console for set value of variable 

  | Feature | CommonJS | ES Modules |
| --- | --- | --- |
| Syntax | require / module.exports | import / export |
| Loading | Synchronous | Asynchronous |
| File extension | .js (default) | .mjs or "type":"module" |
| Top-level await | ❌ No | ✅ Yes |
| Used in | Traditional Node.js | Browsers + Modern Node |

