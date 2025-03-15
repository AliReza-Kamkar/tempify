import { tmpdir } from 'os';
import { createTempFile, createTempFileSync } from './utils';

export type TempifyCallback = (file: TempifyFile) => void | Promise<void>;

export interface TempifyOptions {
  autoCleanup?: boolean;
  suffix?: string;
  prefix?: string;
  extension?: string;
}

export interface TempifyConfig {
  tempDir: string | undefined;
}

export interface TempifyFile<U extends void | Promise<void> = void | Promise<void>> {
  path: string;
  unlink: () => U;
}

let config: TempifyConfig = {
  tempDir: tmpdir(),
};

function tempify(callback: TempifyCallback): Promise<void>;
function tempify(options: TempifyOptions & { autoCleanup?: true }, callback: TempifyCallback): Promise<void>;
function tempify(options: TempifyOptions & { autoCleanup: false }): Promise<TempifyFile>;

async function tempify(
  arg1: TempifyOptions | TempifyCallback = {},
  arg2?: TempifyCallback
): Promise<void | TempifyFile> {

  if (typeof arg1 === 'function') {
    const file = await createTempFile(config.tempDir!, {});
    try {
      const result = arg1(file);
      if (result instanceof Promise) {
        return result.then(() => file.unlink());
      }
      return file.unlink();
    }
    catch (_e) {
      return file.unlink();
    }
  }

  const options = arg1 as TempifyOptions;
  const { autoCleanup = true } = options;

  const file = await createTempFile(config.tempDir!, options);

  if (arg2) {
    if (options.autoCleanup === false) {
      throw new Error('Callback is not allowed when autoCleanup is false');
    }
    try {
      await arg2(file);
      if (autoCleanup) {
        await file.unlink();
        return;
      }
      return file;
    }
    catch (err) {
      if (autoCleanup) {
        await file.unlink();
        throw err;
      }
      throw err;
    }
  }
  else {
    if (autoCleanup) {
      throw new Error('autoCleanup must be false when no callback is provided');
    }
    return file;
  }
}

function tempifySync(callback: TempifyCallback): void;
function tempifySync(options: TempifyOptions & { autoCleanup?: true }, callback: TempifyCallback): void;
function tempifySync(options: TempifyOptions & { autoCleanup: false }): TempifyFile;

function tempifySync(
  arg1: TempifyOptions | TempifyCallback = {},
  arg2?: TempifyCallback
): void | TempifyFile {
  if (typeof arg1 === 'function') {
    const file = createTempFileSync(config.tempDir!, {});
    try {
      arg1(file);
      file.unlink();
    }
    catch (_e) {
      file.unlink();
    }
    return;
  }

  const options = arg1 as TempifyOptions;
  const { autoCleanup = true } = options;

  const file = createTempFileSync(config.tempDir!, options);

  if (arg2) {
    if (options.autoCleanup === false) {
      throw new Error('Callback is not allowed when autoCleanup is false');
    }
    try {
      arg2(file);
      if (autoCleanup) {
        file.unlink();
      }
    }
    catch (err) {
      if (autoCleanup) {
        file.unlink();
      }
      throw err;
    }
  }
  else {
    if (autoCleanup) {
      throw new Error('autoCleanup must be false when no callback is provided');
    }
    return file;
  }
}

tempify.configure = (newConfig: TempifyConfig): void => {
  config = { ...config, ...newConfig };
};

export { tempify, tempifySync };
export default tempify;
