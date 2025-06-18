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
export /*bundle*/ class FileBase<T = IFileMeta> extends ReactiveModel<FileBase<T>> {
	constructor(public meta: T) {
		super({ properties: ['meta'] });
		this.set({ meta });
	}

	/** Update local metadata and notify listeners */
	updateMeta(meta: Partial<IFileMeta>): void {
		this.set({ meta: { ...this.meta, ...meta } });
	}
}
