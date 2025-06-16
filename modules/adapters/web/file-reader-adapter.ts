/**
 * Adapter for reading files in web environments
 */
import { IFileAdapter } from '../../types/adapter-interfaces';
import { IFile, IReadOptions, IStreamOptions } from '../../types/file-interfaces';
import { FileError } from '../../utils/errors';

export /*bundle*/ class FileReaderAdapter implements IFileAdapter {

  supports(file: IFile): boolean { return typeof window !== 'undefined' && file instanceof File; }
  read(file: IFile, opts: IReadOptions = {}): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const { offset = 0, length } = opts;
      const blob = (file as unknown as globalThis.File).slice(offset, length ? offset + length : file.meta.size);
      const fr = new FileReader();
      fr.onerror = () => reject(new FileError(fr.error?.message ?? 'FileReader error'));
      fr.onload = () => resolve(new Uint8Array(fr.result as ArrayBuffer));
      fr.readAsArrayBuffer(blob);
    });
  }

  async write(): Promise<void> { throw new FileError('Browser files are immutable.'); }
  async *stream(file: IFile, opts: IStreamOptions = {}): AsyncIterable<Uint8Array> {
    const { chunk_size = 64 * 1024 } = opts;
    let pos = 0;
    while (pos < file.meta.size) {
      const chunk = await this.read(file, { offset: pos, length: chunk_size });
      pos += chunk.length;
      yield chunk;
    }
  }
  async close(): Promise<void> {}
}
