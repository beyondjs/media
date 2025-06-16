/**
 * Options for reading a file
 */
export /*bundle*/ interface IReadOptions {
  offset?: number;
  length?: number;
}

/**
 * Options for writing to a file
 */
export /*bundle*/ interface IWriteOptions {
  offset?: number;
}

/**
 * Options for streaming a file
 */
export /*bundle*/ interface IStreamOptions {
  chunk_size?: number;
}

import { IFileMeta } from './file-meta';

/**
 * File interface abstraction
 */
export interface IFile {
  meta: IFileMeta;
  read(opts?: IReadOptions): Promise<Uint8Array>;
  write(data: Uint8Array, opts?: IWriteOptions): Promise<void>;
  stream(opts?: IStreamOptions): AsyncIterable<Uint8Array>;
  close(): Promise<void>;
}
