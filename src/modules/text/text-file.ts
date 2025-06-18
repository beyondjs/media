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
