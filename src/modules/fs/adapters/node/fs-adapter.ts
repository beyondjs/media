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

	async write(file: IFile, data: Uint8Array): Promise<void> {
		try {
			await fs.writeFile(file.meta.name, Buffer.from(data), { flag: 'w' });
		} catch (err: any) {
			throw new FileError(err.message);
		}

		file.meta.size = data.byteLength;

		if (typeof (file as any).trigger === 'function') {
			(file as any).trigger('meta.changed', file.meta);
		}
	}

	async writeOffset(file: IFile, data: Uint8Array, opts: IWriteOptions = {}): Promise<void> {
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
