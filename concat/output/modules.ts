/**
 * File: adapters\web\file-reader-adapter.ts
 */
/**
 * Adapter for reading files in web environments
 */
import { IFileAdapter } from '../../core/types/adapter-interfaces';
import { IFile, IReadOptions, IStreamOptions } from '../../core/types/file-interfaces';
import { FileError } from '../../core/errors';

export /*bundle*/ class FileReaderAdapter implements IFileAdapter {
	supports(file: IFile): boolean {
		return typeof window !== 'undefined' && file instanceof File;
	}
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

	async write(): Promise<void> {
		throw new FileError('Browser files are immutable.');
	}
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

/**
 * File: base\index.ts
 */
// modules/core/file-base.ts
import { ReactiveModel } from '@beyond-js/reactive/model';
/**
 * File metadata information
 */

export /*bundle*/ interface IFileMeta {
	name: string;
	size: number;
	type: string;
	last_modified: number;
}

/**
 * Minimal reactive representation of a file, agnostic of I/O.
 * Provides metadata + change-events only.
 */
export /*bundle*/ class FileBase extends ReactiveModel<FileBase> {
	constructor(public meta: IFileMeta) {
		super({ properties: ['meta'] });
		this.set({ meta });
	}

	/** Update local metadata and notify listeners */
	updateMeta(meta: Partial<IFileMeta>): void {
		this.set({ meta: { ...this.meta, ...meta } });
	}
}

/**
 * File: fs\adapters\node\fs-adapter.ts
 */
import { promises as fs } from 'fs';
import { IFileAdapter } from '../../types/adapter-interfaces';
import { IFile, IReadOptions, IWriteOptions, IStreamOptions } from '../../types/file-interfaces';
import { FileError } from '../../errors';
import * as path from 'path';

export /*bundle*/ class FsAdapter implements IFileAdapter {
	public environment: string = 'node';
	supports(): boolean {
		return typeof process !== 'undefined' && !!process.versions?.node;
	}

	private sanitizePath(inputPath: string): string {
		// Reemplaza todas las barras inversas por barras normales (por si vienen de Windows)
		const cleaned = inputPath.replace(/\\/g, '/');

		// Usa path.normalize para convertir a formato del SO actual
		return path.normalize(cleaned);
	}

	async read(file: IFile, opts: IReadOptions = {}): Promise<Uint8Array> {
    const { offset = 0, length } = opts;
    const filePath = this.sanitizePath(file.meta.name);

    // Si no se pasa length, obtener el tamaño real del archivo
    let size = length;
    if (!size) {
        const stat = await fs.stat(filePath);
        size = stat.size;
        // Opcional: actualizar el meta.size para futuras lecturas
        file.meta.size = size;
    }

    const handle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(size);
    const { bytesRead } = await handle.read(buffer, 0, size, offset);
    await handle.close();

    // Retornar solo los bytes realmente leídos
    return new Uint8Array(buffer.subarray(0, bytesRead));
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
 * File: fs\errors.ts
 */
/**
 * Custom error for file operations
 */

export /*bundle*/ class FileError extends Error { constructor(message: string){ super(message); this.name='FileError'; } }

/**
 * File: fs\file.ts
 */
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

/**
 * File: fs\types\adapter-interfaces.ts
 */
import { IFile } from './file-interfaces';
import { IReadOptions, IWriteOptions, IStreamOptions } from './file-interfaces';
/**
 * File adapter interface abstraction
 */
export /*bundle*/ interface IFileAdapter {
	/**
	 * Nombre del entorno soportado por el adapter (por ejemplo: 'node', 'browser', etc)
	 */
	environment: string;
	supports(file: IFile): boolean;
	read(file: IFile, opts?: IReadOptions): Promise<Uint8Array>;
	write(file: IFile, data: Uint8Array, opts?: IWriteOptions): Promise<void>;
	stream(file: IFile, opts?: IStreamOptions): AsyncIterable<Uint8Array>;
	close(file: IFile): Promise<void>;
}

/**
 * File: fs\types\file-interfaces.ts
 */
import { IFileMeta } from '@beyond-js/media/base';
/**
 * Options for reading a file
 *
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

/**
 * File interface abstraction
 */
export /*bundle*/ interface IFile {
	meta: IFileMeta;
	read(opts?: IReadOptions): Promise<Uint8Array>;
	write(data: Uint8Array, opts?: IWriteOptions): Promise<void>;
	stream(opts?: IStreamOptions): AsyncIterable<Uint8Array>;
	close(): Promise<void>;
}

/**
 * File: fs\types\parser-interfaces.ts
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

/**
 * File: text\json-file.ts
 */
import { File } from '@beyond-js/media/fs';
import { encode, decode } from './utils/text-codec';

export /*bundle*/ class JsonFile extends File {
	#data: unknown;

	get data(): unknown {
		return this.#data;
	}

	set data(v: unknown) {
		this.write(encode(JSON.stringify(v, null, 2))).then(() => {
			this.#data = v;
		});
	}

	async load(): Promise<void> {
		const bytes = await this.read();
		const text = decode(bytes);
		try {
			this.#data = JSON.parse(text);
			this.trigger('data.loaded', this.#data);
		} catch (e) {
			this.#data = undefined;
			this.trigger('data.loaded', undefined);
		}
	}
}

/**
 * File: text\parsers\json-parser.ts
 */
/**
 * Parser for JSON files
 */

import { IParser, IFile } from '@beyond-js/media/fs';

export /*bundle*/ class JsonParser implements IParser<unknown> {
	canHandle(file: IFile): boolean {
		return file.meta.type === 'application/json' || file.meta.name.endsWith('.json');
	}

	async parse(file: IFile): Promise<unknown> {
		const bytes = await file.read();
		const text = new TextDecoder().decode(bytes);
		return JSON.parse(text);
	}
}

/**
 * File: text\text-file.ts
 */
// modules/text/text-file.ts
import { File } from '@beyond-js/media/fs';
import { encode, decode } from './utils/text-codec';
import { IReadOptions, IWriteOptions } from '@beyond-js/media/fs';

/** Text-oriented wrapper around the generic File */
export /*bundle*/ class TextFile extends File {
	async readText(opts?: IReadOptions): Promise<string> {
		const bytes = await this.read(opts);
		return decode(bytes);
	}

	async writeText(content: string, opts?: IWriteOptions): Promise<void> {
		await this.write(encode(content), opts);
	}
}

/**
 * File: text\utils\text-codec.ts
 */
export /*bundle*/ const encode = (s: string) => new TextEncoder().encode(s);
export /*bundle*/ const decode = (b: Uint8Array) => new TextDecoder().decode(b);

