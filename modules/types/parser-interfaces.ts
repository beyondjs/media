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
