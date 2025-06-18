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
