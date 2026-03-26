# Node.js File Handling: Beginner to Advanced

**Assumptions:** You're new to Node.js, familiar with basic JavaScript, and want practical examples with explanations.

---

## 🧱 FOUNDATION: The `fs` Module

Node.js provides the built-in `fs` (File System) module. No installation needed.

```js
const fs = require('fs');           // Callback & Sync API
const fsPromises = require('fs').promises; // or require('fs/promises')
```

---

## 📘 LEVEL 1 — BEGINNER: Synchronous vs Asynchronous

### What's the difference?

| | Synchronous | Asynchronous |
|---|---|---|
| Execution | Blocks code until done | Non-blocking, continues running |
| Use case | Scripts, CLI tools | Servers, apps with many users |
| Risk | Freezes app under load | Requires callbacks/promises |

---

### ✅ Reading a File

**Synchronous (blocks execution):**
```js
const fs = require('fs');

const data = fs.readFileSync('hello.txt', 'utf8');
console.log(data); // prints file content
console.log('This runs AFTER file is read');
```

**Asynchronous with Callback:**
```js
fs.readFile('hello.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});
console.log('This runs BEFORE file is read');
```

**Asynchronous with Promises (modern, recommended):**
```js
const fs = require('fs/promises');

async function readFile() {
  const data = await fs.readFile('hello.txt', 'utf8');
  console.log(data);
}
readFile();
```

---

### ✅ Writing a File

```js
// Sync
fs.writeFileSync('output.txt', 'Hello World', 'utf8');

// Async (Promise)
await fs.writeFile('output.txt', 'Hello World', 'utf8');
```

> ⚠️ `writeFile` **overwrites** the file. Use `appendFile` to add to it.

---

### ✅ Appending to a File

```js
// Sync
fs.appendFileSync('log.txt', 'New log entry\n');

// Async
await fs.appendFile('log.txt', 'New log entry\n');
```

---

### ✅ Deleting a File

```js
fs.unlinkSync('file.txt');           // Sync
await fs.unlink('file.txt');         // Async
```

---

### ✅ Checking if File Exists

```js
const exists = fs.existsSync('file.txt'); // returns true/false
console.log(exists);
```

---

## 📗 LEVEL 2 — INTERMEDIATE: Directories & File Info

### Creating a Directory

```js
// Single folder
fs.mkdirSync('myFolder');

// Nested folders (like mkdir -p)
fs.mkdirSync('parent/child/grandchild', { recursive: true });

// Async
await fs.mkdir('myFolder', { recursive: true });
```

---

### Reading a Directory

```js
// Returns array of filenames
const files = fs.readdirSync('./myFolder');
console.log(files); // ['file1.txt', 'file2.js', ...]

// Async
const files = await fs.readdir('./myFolder');
```

**Get file type info with `withFileTypes`:**
```js
const entries = await fs.readdir('./myFolder', { withFileTypes: true });
entries.forEach(entry => {
  if (entry.isFile()) console.log('File:', entry.name);
  if (entry.isDirectory()) console.log('Dir:', entry.name);
});
```

---

### Getting File Stats (size, dates, type)

```js
const stats = fs.statSync('file.txt');

console.log(stats.isFile());        // true
console.log(stats.isDirectory());   // false
console.log(stats.size);            // size in bytes
console.log(stats.mtime);           // last modified time
```

---

### Renaming / Moving Files

```js
fs.renameSync('old.txt', 'new.txt');
await fs.rename('old.txt', 'new.txt');
```

---

### Deleting a Directory

```js
// Remove empty dir
fs.rmdirSync('emptyFolder');

// Remove folder with contents (like rm -rf)
fs.rmSync('fullFolder', { recursive: true, force: true });

// Async
await fs.rm('fullFolder', { recursive: true, force: true });
```

---

### Copying a File

```js
fs.copyFileSync('source.txt', 'dest.txt');
await fs.copyFile('source.txt', 'dest.txt');
```

---

## 📙 LEVEL 3 — ADVANCED: Streams, Watching & Large Files

### 🔁 Streams — Reading/Writing Large Files

Reading a file all at once into memory crashes for large files. **Streams** process data in chunks.

**Read Stream:**
```js
const fs = require('fs');
const readStream = fs.createReadStream('bigfile.txt', 'utf8');

readStream.on('data', chunk => {
  console.log('Chunk received:', chunk);
});

readStream.on('end', () => console.log('Done reading'));
readStream.on('error', err => console.error(err));
```

**Write Stream:**
```js
const writeStream = fs.createWriteStream('output.txt');

writeStream.write('First line\n');
writeStream.write('Second line\n');
writeStream.end(); // signals we're done
```

**Pipe — Copy large file efficiently:**
```js
const read = fs.createReadStream('source.txt');
const write = fs.createWriteStream('dest.txt');

read.pipe(write);
write.on('finish', () => console.log('Copy complete'));
```

---

### 👁️ Watching Files for Changes

```js
fs.watch('file.txt', (eventType, filename) => {
  console.log(`Event: ${eventType} on ${filename}`);
});
```

---

### 🔄 Recursive Directory Walk (List all files in folder tree)

```js
const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath); // recurse
    } else {
      console.log(fullPath);
    }
  }
}

walkDir('./myProject');
```

---

### 📦 Using `FileHandle` (Low-level Promises API)

Gives you fine control — read specific byte ranges, partial writes, etc.

```js
const fs = require('fs/promises');

async function readPartial() {
  const fh = await fs.open('file.txt', 'r');
  const buffer = Buffer.alloc(10); // read only 10 bytes
  await fh.read(buffer, 0, 10, 0); // buffer, offset, length, position
  console.log(buffer.toString());
  await fh.close(); // always close!
}

readPartial();
```

---

## 🗺️ QUICK REFERENCE CHEAT SHEET

| Task | Sync | Async (Promise) |
|---|---|---|
| Read file | `readFileSync` | `readFile` |
| Write file | `writeFileSync` | `writeFile` |
| Append file | `appendFileSync` | `appendFile` |
| Delete file | `unlinkSync` | `unlink` |
| Copy file | `copyFileSync` | `copyFile` |
| Make dir | `mkdirSync` | `mkdir` |
| Read dir | `readdirSync` | `readdir` |
| Delete dir | `rmSync` | `rm` |
| File stats | `statSync` | `stat` |
| Rename/move | `renameSync` | `rename` |

---

## ⚡ BEST PRACTICES

1. **Always use async** in servers/APIs — never sync (it blocks all users)
2. **Use `try/catch` with async/await** for clean error handling
3. **Use `{ recursive: true }`** when creating nested directories
4. **Always `.close()` FileHandles** to prevent memory leaks
5. **Use streams** for files > a few MB

---
```js
// logger.js
const fs = require('fs/promises');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'app.log');

// 🕐 Format: [2026-03-02 14:35:22] [INFO] Your message here
function formatEntry(level, message) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  return `[${timestamp}] [${level.padEnd(5)}] ${message}\n`;
}

async function log(level, message) {
  const entry = formatEntry(level, message);
  
  try {
    await fs.appendFile(LOG_FILE, entry, 'utf8');
    process.stdout.write(entry); // also print to console
  } catch (err) {
    console.error('Logger failed:', err.message);
  }
}

// 🎯 Public API — three log levels
const logger = {
  info:  (msg) => log('INFO',  msg),
  warn:  (msg) => log('WARN',  msg),
  error: (msg) => log('ERROR', msg),
};

module.exports = logger;
```


```js
// scanner.js
const fs   = require('fs');
const path = require('path');

// 🔁 Recursive scanner — returns array of file info objects
function scanDir(dir, extension = '.js', depth = 0) {
  let results = [];

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.warn(`  ⚠️  Cannot read: ${dir} (${err.message})`);
    return results;
  }

  for (const entry of entries) {
    // ⛔ Skip node_modules and hidden folders (.git, .cache etc)
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subdirectory
      const nested = scanDir(fullPath, extension, depth + 1);
      results = results.concat(nested);

    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      const stats = fs.statSync(fullPath);
      results.push({
        name:     entry.name,
        fullPath: fullPath,
        size:     stats.size,       // bytes
        modified: stats.mtime,      // last modified date
        depth:    depth,
      });
    }
  }

  return results;
}

// 📊 Pretty print results
function printReport(files, rootDir, extension) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  📂 Scan Results — ${extension} files in: ${rootDir}`);
  console.log('═'.repeat(60));

  if (files.length === 0) {
    console.log('  No files found.');
    return;
  }

  // Print each file with indentation based on depth
  files.forEach(file => {
    const indent  = '  ' + '  '.repeat(file.depth);
    const relPath = path.relative(rootDir, file.fullPath);
    const sizeKB  = (file.size / 1024).toFixed(2);
    const date    = file.modified.toLocaleDateString();
    console.log(`${indent}📄 ${relPath}  (${sizeKB} KB, modified: ${date})`);
  });

  // Summary
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  console.log('─'.repeat(60));
  console.log(`  ✅ Total files : ${files.length}`);
  console.log(`  💾 Total size  : ${(totalSize / 1024).toFixed(2)} KB`);

  // Largest file
  const largest = files.reduce((a, b) => a.size > b.size ? a : b);
  console.log(`  🏆 Largest file: ${path.relative(rootDir, largest.fullPath)} (${(largest.size/1024).toFixed(2)} KB)`);
  console.log('═'.repeat(60) + '\n');
}

// ▶️  Entry point
const targetDir = process.argv[2] || '.';          // default: current folder
const extension = process.argv[3] || '.js';         // default: .js files
const absTarget = path.resolve(targetDir);

console.log(`\n🔍 Scanning: ${absTarget}`);
console.log(`🎯 Looking for: *${extension} files`);

const files = scanDir(absTarget, extension);
printReport(files, absTarget, extension);
```