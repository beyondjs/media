import { File } from '@beyond-js/media/fs';
import { encode, decode } from './utils/text-codec';
/**
 * JSON file abstraction on top of the reactive `File` core.
 * ---------------------------------------------------------
 * Responsibilities:
 *  - Load the file content into a JS object (`load`)
 *  - Patch selected keys and persist immediately (`patch`)
 *  - Replace the entire object and persist (`replace`)
 *  - Update in-memory data without persistence (`update`)
 *  - Clear in-memory data (`clean`)
 *
 * Events:
 *  - 'data.loaded'     → after loading from disk
 *  - 'data.updated'    → after an in-memory update
 *  - 'data.cleaned'    → after clearing the object
 *  - 'write.completed' → after a patch or replace is flushed to disk
 */

export /*bundle*/ class JsonFile extends File {
	#data: any = {};
	#pretty = true;

	/** Returns the current in-memory JSON value */
	get data() {
		console.log(90, this.#data);
		return this.#data;
	}

	/** Reads the file, parses JSON, stores it in memory and notifies listeners */
	async load(): Promise<void> {
		const raw = await this.read();
		console.log(1, raw);
		try {
			this.#data = JSON.parse(decode(raw));
			this.trigger('data.loaded', this.#data);
		} catch (e) {
			console.error(e, this.meta.name);
		}
	}

	/**
	 * Shallow-merges partial keys into the current object and persists the result.
	 * @param partial Keys to override or add.
	 */
	async patch(partial: Record<string, unknown>): Promise<void> {
		this.#data = { ...this.#data, ...partial };
		await this.#save();
	}

	/**
	 * Guarda el objeto JSON y lo persiste.
	 * @param newData El valor a guardar.
	 * @param overwrite Si es true, reemplaza todo el objeto; si es false (por defecto), hace merge superficial.
	 */
	async save(newData: Record<string, unknown>, overwrite = false): Promise<void> {
		this.#data = overwrite ? newData : { ...this.#data, ...newData };
		console.log(12, this.#data);
		await this.#save();
	}

	/**
	 * Updates the in-memory object without writing to disk.
	 * Useful for batching multiple changes before a manual `patch`/`replace`
	 * or for transient state handling in the application layer.
	 * @param partial Keys to override or add.
	 */
	update(partial: Record<string, unknown>): void {
		this.#data = { ...this.#data, ...partial };
		this.trigger('data.updated', this.#data);
	}

	/**
	 * Clears the in-memory object without writing to disk.
	 * Call `replace({})` if you also need to persist the empty state.
	 */
	clean(): void {
		this.#data = {};
		this.trigger('data.cleaned', this.#data);
	}

	/** Internal helper to serialise and write the in-memory data to disk */
	async #save(): Promise<void> {
		const json = JSON.stringify(this.#data, null, this.#pretty ? 2 : 0);
		await this.write(encode(json));
		this.trigger('write.completed');
	}
}
