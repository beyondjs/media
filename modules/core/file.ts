/**
 * Core File implementation
 */
import { IFile, IReadOptions, IWriteOptions, IStreamOptions } from '../types/file-interfaces';
import { IFileMeta } from '../types/file-meta';
import { IFileAdapter } from '../types/adapter-interfaces';
import { FsAdapter } from '../adapters/node/fs-adapter';
import { FileReaderAdapter } from '../adapters/web/file-reader-adapter';
import { FileError } from '../utils/errors';

import { ReactiveModel } from '@beyond-js/reactive/model';

export /*bundle*/ class File extends ReactiveModel<File> implements IFile {
  private static adapters: IFileAdapter[] = [new FsAdapter(), new FileReaderAdapter()];
  private adapter: IFileAdapter;
  constructor(public meta: IFileMeta) {
    super({ properties: ['meta'] });
    const ad = File.adapters.find(a => a.supports(this));
    if (!ad) throw new FileError('No compatible adapter found.');
    this.adapter = ad;
    this.set({ meta });
  }
  static registerAdapter(a: IFileAdapter): void { File.adapters.unshift(a); }
  async read(opts?: IReadOptions) {
    const bytes = await this.adapter.read(this, opts);
    this.trigger('read.completed', bytes);
    return bytes;
  }
  async write(d: Uint8Array, opts?: IWriteOptions) {
    await this.adapter.write(this, d, opts);
    this.trigger('write.completed', undefined);
  }
  stream(opts?: IStreamOptions) { return this.adapter.stream(this, opts); }
  async close() { return this.adapter.close(this); }

  updateMetaSize(size: number) {
    this.meta.size = size;
    this.trigger('meta.changed', this.meta);
  }
}

