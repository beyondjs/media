/**
 * Core File implementation
 */
import { IFile, IReadOptions, IWriteOptions, IStreamOptions } from './types/file-interfaces';
import { IFileMeta, FileBase } from '@beyond-js/media/base';

import { IFileAdapter } from './types/adapter-interfaces';
import { FsAdapter } from './adapters/node/fs-adapter';
import { FileError } from './errors';

import { ReactiveModel } from '@beyond-js/reactive/model';

export /*bundle*/ class File extends FileBase implements IFile {
	private static adapters: IFileAdapter[] = [new FsAdapter()];
	private adapter: IFileAdapter;
	/**
	 * @param meta Metadata del archivo
	 * @param environment Entorno a usar (por defecto: 'node')
	 */
	constructor(public meta: IFileMeta, environment: string = 'node') {
		super(meta);
		if (environment === 'node') {
			// Usa el FsAdapter por defecto
			const nodeAdapter = File.adapters.find(a => a.environment === 'node');
			if (!nodeAdapter) throw new FileError('No adapter found for environment: node');
			this.adapter = nodeAdapter;
		} else {
			// Busca un adapter para el entorno solicitado
			const envAdapter = File.adapters.find(a => a.environment === environment);
			if (!envAdapter) throw new FileError(`No adapter found for environment: ${environment}`);
			this.adapter = envAdapter;
		}
	}
	static registerAdapter(a: IFileAdapter): void {
		File.adapters.unshift(a);
	}

	async read(opts?: IReadOptions): Promise<Uint8Array> {
		const bytes = await this.adapter.read(this, opts);
		this.trigger('read.completed', bytes);
		return bytes;
	}
	async write(d: Uint8Array, opts?: IWriteOptions): Promise<void> {
		await this.adapter.write(this, d, opts);
		this.trigger('write.completed', undefined);
	}
	async *stream(opts?: IStreamOptions): AsyncIterable<Uint8Array> {
		return this.adapter.stream(this, opts);
	}
	async close(): Promise<void> {
		return this.adapter.close(this);
	}

	updateMetaSize(size: number): void {
		this.meta.size = size;
		this.trigger('meta.changed', this.meta);
	}
}
