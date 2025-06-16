````md
# @beyond-js/media

**`@beyond-js/media`** is a universal, modular, and reactive TypeScript library for managing files across environments like **Node.js**, **Web**, and future runtimes.  
It provides a unified API for reading, writing, streaming, parsing, and extending file operations — with first-class support for **JSON files**, **custom adapters**, and **reactive data flow**.

---

## 📦 Features

- ✅ Reactive `File` object with event hooks (`read.completed`, `write.completed`, etc.)
- ✅ Multi-environment support (Node.js, Web)
- ✅ Pluggable adapters and parsers
- ✅ JSON file abstraction with object-level interaction
- ✅ Built-in streaming and chunk reading
- ✅ Type-safe API using `TypeScript`
- ✅ Designed for extensibility: uploaders, audio/video, and office file support

---

## 📁 Installation

```bash
pnpm add @beyond-js/media
# or
npm install @beyond-js/media
````

---

## 🧠 Usage

### 1. Create and write to a file (Node)

```ts
import { File } from '@beyond-js/media/core/file';
import { encode } from '@beyond-js/media/utils/text-codec';

const file = new File({
  name: 'example.txt',
  size: 0,
  type: 'text/plain',
  last_modified: Date.now()
});

file.on('write.completed', () => console.log('Write finished'));
await file.write(encode('Hello world!'));
```

---

### 2. Create and manage a JSON file

```ts
import { JsonFile } from '@beyond-js/media/entities/json-file';

const jsonFile = new JsonFile({
  name: 'config.json',
  size: 0,
  type: 'application/json',
  last_modified: Date.now()
});

jsonFile.data = { enabled: true, version: 1 };
await jsonFile.load();

console.log(jsonFile.data); // Output: { enabled: true, version: 1 }
```

---

### 3. Stream a file in chunks

```ts
for await (const chunk of file.stream({ chunk_size: 1024 })) {
  console.log('Chunk', chunk.length);
}
```

---

## 🔄 Reactive Hooks

All `File` and `JsonFile` objects are reactive via `@beyond-js/reactive/model`. You can:

* Subscribe to file lifecycle events:

  ```ts
  file.on('read.completed', data => console.log('File read', data));
  file.on('meta.changed', meta => console.log('Metadata updated', meta));
  ```

* Integrate with UI or observable-based workflows.

---

## 🧩 Extending the Library

### 📂 Add a new Adapter

Create a class implementing `IFileAdapter` and register it:

```ts
import { File } from '@beyond-js/media/core/file';

File.registerAdapter(new MyCustomAdapter());
```

### 🧬 Add a new Parser

Implement `IParser<T>` and use it to convert file content into structured data:

```ts
const parser = new XmlParser();
if (parser.canHandle(file)) {
  const obj = await parser.parse(file);
}
```

---

## 🧱 Project Structure

```
@beyond-js/media/
├─ core/           # Base File implementation
├─ adapters/       # Node.js / Web adapters
├─ entities/       # Specialized reactive files
├─ parsers/        # File content parsers
├─ types/          # Interfaces and typings
└─ utils/          # Text codec, errors, etc.
```

---

## 🚀 Roadmap

* [x] JSON parsing
* [x] Node + Web file reading/writing
* [ ] File uploader module
* [ ] Audio & video support
* [ ] Office document integration
* [ ] Caching and content hash APIs
* [ ] WebSocket stream writer

---

## 📄 License

MIT © 2025 — Maintained by the community.

```
```
