import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import tempify, { TempifyFile, TempifyOptions } from '../src/tempify';

describe('tempify', () => {
  const customTempDir = path.join(process.cwd(), 'tempify-temp');

  beforeEach(() => {
    // Create a custom temp directory for testing
    if (!fs.existsSync(customTempDir)) {
      fs.mkdirSync(customTempDir);
    }
    tempify.configure({ tempDir: customTempDir });
  });

  afterEach(() => {
    // Clean up the custom temp directory after each test
    if (fs.existsSync(customTempDir)) {
      fs.rmSync(customTempDir, { recursive: true, force: true });
    }
    tempify.configure({ tempDir: undefined }); // Reset to default
  });

  // Test Method 1: Simple async usage
  it('creates and auto-cleans a temp file with simple async callback', async () => {
    let filePath: string;
    await tempify(async (file: TempifyFile) => {
      filePath = file.path;
      await fsPromises.writeFile(filePath, 'Async test');
      expect(fs.existsSync(filePath)).toBe(true);
    });
    expect(fs.existsSync(filePath!)).toBe(false); // File should be deleted
  });

  // Test Method 1: Simple sync usage
  it('creates and auto-cleans a temp file with simple sync callback', () => {
    let filePath: string;
    tempify({ sync: true }, (file: TempifyFile) => {
      filePath = file.path;
      fs.writeFileSync(file.path, 'Sync test');
      expect(fs.existsSync(filePath)).toBe(true);
    });
    expect(fs.existsSync(filePath!)).toBe(false); // File should be deleted
  });

  // Test Method 2: Async with options
  it('creates and auto-cleans a temp file with options (async)', async () => {
    const options: TempifyOptions = {
      prefix: 'test-',
      suffix: '-end',
      extension: '.txt',
    };
    let filePath: string;
    await tempify(options, async (file: TempifyFile) => {
      filePath = file.path;
      await fsPromises.writeFile(file.path, 'Options async test');
      expect(file.path).toMatch(/^.*test-.*-end\.txt$/);
      expect(fs.existsSync(filePath)).toBe(true);
    });
    expect(fs.existsSync(filePath!)).toBe(false); // File should be deleted
  });

  // Test Method 2: Sync with options
  it('creates and auto-cleans a temp file with options (sync)', () => {
    const options: TempifyOptions = {
      prefix: 'test-',
      suffix: '-end',
      extension: '.txt',
      sync: true,
    };
    let filePath: string;
    tempify(options, (file: TempifyFile) => {
      filePath = file.path;
      fs.writeFileSync(file.path, 'Options sync test');
      expect(file.path).toMatch(/^.*test-.*-end\.txt$/);
      expect(fs.existsSync(filePath)).toBe(true);
    });
    expect(fs.existsSync(filePath!)).toBe(false); // File should be deleted
  });

  // Test Method 3: Async manual cleanup
  it('creates a temp file for manual cleanup (async)', async () => {
    const file = await tempify({ autoCleanup: false });
    expect(fs.existsSync(file.path)).toBe(false); // File not written yet
    await fsPromises.writeFile(file.path, 'Manual async test');
    expect(fs.existsSync(file.path)).toBe(true);
    await file.unlink();
    expect(fs.existsSync(file.path)).toBe(false);
  });

  // Test Method 3: Sync manual cleanup
  it('creates a temp file for manual cleanup (sync)', () => {
    const file = tempify({ autoCleanup: false, sync: true });
    expect(fs.existsSync(file.path)).toBe(false); // File not written yet
    fs.writeFileSync(file.path, 'Manual sync test');
    expect(fs.existsSync(file.path)).toBe(true);
    file.unlink();
    expect(fs.existsSync(file.path)).toBe(false);
  });

  // Test custom temp directory configuration
  it('uses a custom temp directory', async () => {
    await tempify(async (file: TempifyFile) => {
      expect(file.path.startsWith(customTempDir)).toBe(true);
      await fsPromises.writeFile(file.path, 'Custom dir test');
      expect(fs.existsSync(file.path)).toBe(true);
    });
  });

  // Test error: autoCleanup true without callback
  it('throws error when autoCleanup is true without callback', () => {
    // @ts-expect-error: This is intentionally invalid usage to test runtime error
    expect(() => tempify({ autoCleanup: true })).toThrow(
      'autoCleanup must be false when no callback is provided'
    );
  });

  // Test error: sync mode with async callback
  it('throws error when sync is true with async callback', () => {
    expect(() =>
      tempify({ sync: true }, async (file: TempifyFile) => {
        await fsPromises.writeFile(file.path, 'Invalid async');
      })
    ).toThrow('Callback cannot return a Promise when sync: true');
  });
});
