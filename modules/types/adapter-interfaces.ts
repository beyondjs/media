import { IFile } from './file-interfaces';
import { IReadOptions, IWriteOptions, IStreamOptions } from './file-interfaces';
/**
 * File adapter interface abstraction
 */
export /*bundle*/ interface IFileAdapter {
  supports(file: IFile): boolean;
  read(file: IFile, opts?: IReadOptions): Promise<Uint8Array>;
  write(file: IFile, data: Uint8Array, opts?: IWriteOptions): Promise<void>;
  stream(file: IFile, opts?: IStreamOptions): AsyncIterable<Uint8Array>;
  close(file: IFile): Promise<void>;
}
