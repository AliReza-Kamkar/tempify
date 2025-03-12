import { randomUUID } from 'crypto';
import { promises as fsPromises, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Callback type for tempify
export type TempifyCallback = (file: TempifyFile) => void | Promise<void>;

// Options interface for configuring tempify
export interface TempifyOptions {
  autoCleanup?: boolean;
  suffix?: string;
  prefix?: string;
  extension?: string;
  sync?: boolean; // Toggle sync/async behavior
}

// Configuration interface for temp directory
export interface TempifyConfig {
  tempDir?: string;
}

// File handle returned by tempify
export interface TempifyFile {
  path: string;
  unlink: () => void | Promise<void>; // Supports both sync and async
}

// Global configuration (default temp directory is os.tmpdir())
let config: TempifyConfig = {
  tempDir: tmpdir(),
};

// Function to create a temp file object
function createTempFile(options: TempifyOptions = {}): TempifyFile {
  const { prefix = '', suffix = '', extension = '', sync = false } = options;
  const path = join(
    config.tempDir ?? tmpdir(),
    `${prefix}tempify-${randomUUID()}${suffix}${extension}`
  );

  function unlink(): void | Promise<void> {
    if (sync) {
      try {
        unlinkSync(path);
      }
      catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw err; // Ignore if file doesn't exist
        }
      }
    }
    else {
      return (async () => {
        try {
          await fsPromises.unlink(path);
        }
        catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw err; // Ignore if file doesn't exist
          }
        }
      })();
    }
  }

  return { path, unlink };
}

// Main tempify function with overloads
// Async overloads
function tempify(callback: TempifyCallback): Promise<void>;
function tempify(options: TempifyOptions, callback: TempifyCallback): Promise<void>;
function tempify(options: TempifyOptions & { autoCleanup: false; sync?: false }): Promise<TempifyFile>;

// Sync overloads
function tempify(options: TempifyOptions & { sync: true }, callback: TempifyCallback): void;
function tempify(options: TempifyOptions & { sync: true; autoCleanup: false }): TempifyFile;

// Implementation
function tempify(
  arg1: TempifyOptions | TempifyCallback = {},
  arg2?: TempifyCallback
): void | TempifyFile | Promise<void | TempifyFile> {

  // Handle simple usage: tempify(callback)
  if (typeof arg1 === 'function') {
    const file = createTempFile();
    try {
      const result = arg1(file);
      if (result instanceof Promise) {
        return result.then(() => file.unlink());
      }
      return file.unlink();
    }
    catch(_e) {
      return file.unlink();
    }
  }

  // Handle options-based usage
  const options = arg1 as TempifyOptions;
  const { autoCleanup = true, sync = false } = options;

  const file = createTempFile(options);

  if (arg2) {
    // Usage with options and callback: tempify(options, callback)
    try {
      const result = arg2(file);
      if (sync) {
        if (result instanceof Promise) {
          throw new Error('Callback cannot return a Promise when sync: true');
        }
        if (autoCleanup) {
          file.unlink();
        }
      }
      else {
        if (result instanceof Promise) {
          return result.then(() => {
            if (autoCleanup) return file.unlink();
          });
        }
        else if (autoCleanup) {
          return file.unlink();
        }
      }
    }
    catch (err) {
      if (autoCleanup) {
        if (sync) {
          file.unlink();
        }
        else {
          return (file.unlink() as Promise<void>).then(() => {
            throw err;
          });
        }
      }
      throw err;
    }
  }
  else {
    // Usage without callback: tempify({ autoCleanup: false })
    if (autoCleanup) {
      throw new Error('autoCleanup must be false when no callback is provided');
    }
    return file; // Return file directly (sync or async)
  }
}

// Configuration method
tempify.configure = (newConfig: TempifyConfig): void => {
  config = { ...config, ...newConfig };
};

export default tempify;
