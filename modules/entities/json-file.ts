import { File } from '../core/file';
import { encode, decode } from '../utils/text-codec';

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

