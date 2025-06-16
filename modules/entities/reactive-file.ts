import { ReactiveModel } from '@beyond-js/reactive/model';
import { File } from '../core/file';
import { IFileMeta } from '../types/file-meta';
import { IReadOptions, IWriteOptions, IStreamOptions } from '../types/file-interfaces';

interface IReactiveFile {
  file: File;
  meta: IFileMeta;
}

export /*bundle*/ class ReactiveFile extends ReactiveModel<IReactiveFile> {
  declare file: File;
  declare meta: IFileMeta;
  #file: File;

  constructor(meta: IFileMeta) {
    super({ properties: ['file', 'meta'] });
    this.#file = new File(meta);
    this.set({ file: this.#file, meta });
  }

  async read(opts?: IReadOptions): Promise<Uint8Array> {
    const data = await this.file.read(opts);
    this.trigger('read.completed', data);
    return data;
  }

  async write(data: Uint8Array, opts?: IWriteOptions): Promise<void> {
    await this.file.write(data, opts);
    this.trigger('write.completed');
  }

  stream(opts?: IStreamOptions): AsyncIterable<Uint8Array> {
    return this.file.stream(opts);
  }

  async close(): Promise<void> {
    return this.file.close();
  }
}
