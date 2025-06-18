/**
 * File: adapters\node\fs-adapter.ts
 */
import { promises as fs } from 'fs';
import { IFileAdapter } from '../../types/adapter-interfaces';
import { IFile, IReadOptions, IWriteOptions, IStreamOptions } from '../../types/file-interfaces';
import { FileError } from '../../errors';

export /*bundle*/ class FsAdapter implements IFileAdapter {
	supports(): boolean {
		return typeof process !== 'undefined' && !!process.versions?.node;
	}
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

/**
 * File: errors.ts
 */
/**
 * Custom error for file operations
 */

export /*bundle*/ class FileError extends Error { constructor(message: string){ super(message); this.name='FileError'; } }

/**
 * File: file.ts
 */
/**
 * Core File implementation
 */
import { IFile, IReadOptions, IWriteOptions, IStreamOptions } from './types/file-interfaces';
import { IFileMeta } from './types/file-meta';
import { IFileAdapter } from './types/adapter-interfaces';
import { FsAdapter } from './adapters/node/fs-adapter';
import { FileError } from './errors';

import { ReactiveModel } from '@beyond-js/reactive/model';

export /*bundle*/ class File extends ReactiveModel<File> implements IFile {
	private static adapters: IFileAdapter[] = [new FsAdapter()];
	private adapter: IFileAdapter;
	constructor(public meta: IFileMeta) {
		super({ properties: ['meta'] });
		const ad = File.adapters.find(a => a.supports(this));
		if (!ad) throw new FileError('No compatible adapter found.');
		this.adapter = ad;
		this.set({ meta });
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

/**
 * File: types\adapter-interfaces.ts
 */
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

/**
 * File: types\file-interfaces.ts
 */
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

/**
 * File: types\file-meta.ts
 */
/**
 * File metadata information
 */
/**
 * File metadata information
 */
export /*bundle*/ interface IFileMeta { name: string; size: number; type: string; last_modified: number; }

/**
 * File: types\parser-interfaces.ts
 */
/**
 * Parser interface for generic file parsing
 */
import { IFile } from './file-interfaces';
/**
 * Parser interface for generic file parsing
 */
export /*bundle*/ interface IParser<T> {
  canHandle(file: IFile): boolean;
  parse(file: IFile): Promise<T>;
}

