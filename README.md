# Tempify - Temporary File for Node.js 🔥

tempify is a simple library for creating temporary files in Node.js. It provides an easy-to-use API for creating temporary files with automatic cleanup options, making it perfect for scenarios where you need temporary files without the hassle of manual file management. It supports both synchronous and asynchronous operations with customizable options.

## Installation ⚙️
You can install this package with npm:
```bash
npm install tempify
```

## Usage Overview ✨
Here are some examples of using tempify:

### Simple Async Usage
```typescript
import { tempify } from 'tempify';

await tempify((file) => {
  console.log(`Temporary file created at: ${file.path}. File automatically removed after this callback`);
});
```

### Simple Sync Usage
```typescript
import fs from 'fs';
import { tempifySync } from 'tempify';

tempifySync((file) => {
  fs.writeFileSync(file.path, 'Sync test');
  console.log(`Temporary file created at: ${file.path}. File automatically removed after this callback`);
});
```
### Async with Options

```typescript
import { tempify } from 'tempify';
import fs from 'fs/promises';

const options = {
  prefix: 'test-',
  suffix: '-end',
  extension: '.txt',
};

await tempify(options, async (file) => {
  await fs.writeFile(file.path, 'Options async test');
  console.log(`Temporary file created at: ${file.path}. File automatically removed after this callback`);
});
```

### Sync with Options
```typescript
import { tempifySync } from 'tempify';
import fs from 'fs';

const options = {
  prefix: 'test-',
  suffix: '-end',
  extension: '.txt',
};

tempifySync(options, (file) => {
  fs.writeFileSync(file.path, 'Options sync test');
  console.log(`Temporary file created at: ${file.path}. File automatically removed after this callback`);
});
```

### Manual Cleanup
```typescript
import { tempify } from 'tempify';
import fs from 'fs/promises';

const file = await tempify({ autoCleanup: false });
await fs.writeFile(file.path, 'Manual async test');
console.log(`Temporary file created at: ${file.path} and NOT removed automatically.`);

// Manual cleanup
await file.unlink();
```

### API Options
- `autoCleanup?: boolean` - Whether to automatically delete the file after the callback (default: `true`).
- `prefix?: string` - Prefix for the temporary file name (default: `''`).
- `suffix?: string` - Suffix for the temporary file name (default: `''`).
- `extension?: string` - File extension (default: `''`).

### Functions
- `tempify` - Asynchronous function for creating temporary files.
- `tempifySync` - Synchronous function for creating temporary files.
- `tempify.configure({ tempDir?: string })` - Configure the temporary directory (defaults to `os.tmpdir()`).

## Running Tests 🐞
Make sure you have installed <code>npm</code> and then run the below command:
```bash
npm run test
```

## Author
AliReza Kamkar (alireza.kamkar@outlook.com)

## License

MIT License

Copyright (c) 2025 AliReza Kamkar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
