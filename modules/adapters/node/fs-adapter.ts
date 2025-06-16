import { promises as fs } from 'fs';
import { IFileAdapter } from '../../types/adapter-interfaces';
import { IFile, IReadOptions, IWriteOptions, IStreamOptions } from '../../types/file-interfaces';

export /*bundle*/ class FsAdapter implements IFileAdapter {
  supports(): boolean { return typeof process !== 'undefined' && !!process.versions?.node; }
  async read(file: IFile, opts: IReadOptions = {}): Promise<Uint8Array> {
    const { offset = 0, length } = opts;
    const handle = await fs.open(file.meta.name, 'r');
    const size = length ?? file.meta.size;
    const buffer = Buffer.alloc(size);
    await handle.read(buffer, 0, size, offset);
    await handle.close();
    return new Uint8Array(buffer);
  }
  async write(file: IFile, data: Uint8Array, opts: IWriteOptions = {}): Promise<void> {
    const { offset = 0 } = opts;
    try {
      const handle = await fs.open(file.meta.name, 'r+');
      await handle.write(Buffer.from(data), 0, data.byteLength, offset);
      await handle.close();
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        await fs.writeFile(file.meta.name, Buffer.from(data));
      } else {
        throw new FileError(err.message);
      }
    }
    file.meta.size = data.byteLength;
    if (typeof (file as any).trigger === 'function') {
      (file as any).trigger('meta.changed', file.meta);
    }
  }
  async *stream(file: IFile, opts: IStreamOptions = {}): AsyncIterable<Uint8Array> {
    const { chunk_size = 64 * 1024 } = opts;
    const handle = await fs.open(file.meta.name, 'r');
    const buffer = Buffer.alloc(chunk_size);
    let pos = 0;
    while (pos < file.meta.size) {
      const { bytesRead } = await handle.read(buffer, 0, chunk_size, pos);
      if (!bytesRead) break;
      pos += bytesRead;
      yield new Uint8Array(buffer.subarray(0, bytesRead));
    }
    await handle.close();
  }
  async close(): Promise<void> {}
}

