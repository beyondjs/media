/**
 * Parser for JSON files
 */
import { IParser } from '../types/parser-interfaces';
import { IFile } from '../types/file-interfaces';

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
