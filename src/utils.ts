import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { promises as fsPromises, unlinkSync, writeFileSync } from 'fs';
import { TempifyFile, TempifyOptions } from './tempify';

export async function createTempFile(tempDir: string, options: TempifyOptions = {}): Promise<TempifyFile<Promise<void>>> {
  const { prefix = '', suffix = '', extension = '' } = options;
  const path = join(
    tempDir ?? tmpdir(),
    `${prefix}tempify-${randomUUID()}${suffix}${extension}`
  );

  try {
    await fsPromises.unlink(path);
  }
  catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
  }

  await fsPromises.writeFile(path, '');

  async function unlink(): Promise<void> {
    try {
      await fsPromises.unlink(path);
    }
    catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
  }

  return { path, unlink };
}

export function createTempFileSync(tempDir: string, options: TempifyOptions = {}): TempifyFile<void> {
  const { prefix = '', suffix = '', extension = '' } = options;
  const path = join(
    tempDir ?? tmpdir(),
    `${prefix}tempify-${randomUUID()}${suffix}${extension}`
  );

  try {
    unlinkSync(path);
  }
  catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
  }
  writeFileSync(path, '');

  function unlink(): void {
    try {
      unlinkSync(path);
    }
    catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
  }

  return { path, unlink };
}
