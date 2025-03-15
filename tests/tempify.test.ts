import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { describe, it, expect, afterEach } from 'vitest';
import tempify, { tempifySync, TempifyFile } from '../src/tempify';

describe('tempify', () => {
  const customTempDir = path.join(process.cwd(), 'tempify-temp');

  afterEach(() => {
    if (fs.existsSync(customTempDir)) {
      fs.rmSync(customTempDir, { recursive: true, force: true });
    }
    tempify.configure({ tempDir: undefined });
  });

  it('creates and auto-cleans a temp file with simple async callback', async () => {
    let filePath: string;
    await tempify(async (file: TempifyFile) => {
      filePath = file.path;
      await fsPromises.writeFile(filePath, 'Async test');
      expect(fs.existsSync(filePath)).toBe(true);
    });
    expect(fs.existsSync(filePath!)).toBe(false);
  });

  it('creates and auto-cleans a temp file with simple sync callback', () => {
    let filePath: string;
    tempifySync((file: TempifyFile) => {
      filePath = file.path;
      fs.writeFileSync(file.path, 'Sync test');
      expect(fs.existsSync(filePath)).toBe(true);
    });
    expect(fs.existsSync(filePath!)).toBe(false);
  });

  it('creates and auto-cleans a temp file with options (async)', async () => {
    const options = {
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
    expect(fs.existsSync(filePath!)).toBe(false);
  });

  it('creates and auto-cleans a temp file with options (sync)', () => {
    const options = {
      prefix: 'test-',
      suffix: '-end',
      extension: '.txt',
    };
    let filePath: string;
    tempifySync(options, (file: TempifyFile) => {
      filePath = file.path;
      fs.writeFileSync(file.path, 'Options sync test');
      expect(file.path).toMatch(/^.*test-.*-end\.txt$/);
      expect(fs.existsSync(filePath)).toBe(true);
    });
    expect(fs.existsSync(filePath!)).toBe(false);
  });

  it('creates a temp file for manual cleanup (async)', async () => {
    const file = await tempify({ autoCleanup: false });
    expect(fs.existsSync(file.path)).toBe(true);
    await fsPromises.writeFile(file.path, 'Manual async test');
    expect(fs.existsSync(file.path)).toBe(true);
    await file.unlink();
    expect(fs.existsSync(file.path)).toBe(false);
  });

  it('creates a temp file for manual cleanup (sync)', () => {
    const file = tempifySync({ autoCleanup: false });
    expect(fs.existsSync(file.path)).toBe(true);
    fs.writeFileSync(file.path, 'Manual sync test');
    file.unlink();
    expect(fs.existsSync(file.path)).toBe(false);
  });

  it('uses a custom temp directory', async () => {
    tempify.configure({ tempDir: customTempDir });
    if (!fs.existsSync(customTempDir)) {
      fs.mkdirSync(customTempDir);
    }
    await tempify(async (file: TempifyFile) => {
      expect(file.path.startsWith(customTempDir)).toBe(true);
      await fsPromises.writeFile(file.path, 'Custom dir test');
      expect(fs.existsSync(file.path)).toBe(true);
    });
  });

  it('throws error when autoCleanup is true without callback', async () => {
    // @ts-expect-error: This is intentionally invalid usage to test runtime error
    await expect(() => tempify({ autoCleanup: true })).rejects.toThrow(
      'autoCleanup must be false when no callback is provided'
    );
  });

  it('throws error when autoCleanup is true without callback (sync)', () => {
    // @ts-expect-error: This is intentionally invalid usage to test runtime error
    expect(() => tempifySync({ autoCleanup: true })).toThrow(
      'autoCleanup must be false when no callback is provided'
    );
  });
});
