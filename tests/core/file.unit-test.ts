import { describe, it, expect, vi, beforeEach } from 'vitest';
import { File } from '../../../modules/core/file';
import type { IFileMeta } from '../../../modules/types/file-meta';

// Mocked adapters
const mockRead = vi.fn().mockResolvedValue(new Uint8Array([1,2,3]));
const mockWrite = vi.fn().mockResolvedValue(undefined);

class MockFile extends File {
  async read() {
    return mockRead();
  }
  async write(data: Uint8Array) {
    return mockWrite(data);
  }
}

describe('File', () => {
  let file: MockFile;
  const meta: IFileMeta = { name: 'test.txt', size: 3, type: 'text/plain', last_modified: Date.now() };

  beforeEach(() => {
    file = new MockFile(meta);
    mockRead.mockClear();
    mockWrite.mockClear();
  });

  it('should read file data', async () => {
    const data = await file.read();
    expect(data).toEqual(new Uint8Array([1,2,3]));
    expect(mockRead).toHaveBeenCalled();
  });

  it('should write file data', async () => {
    const buffer = new Uint8Array([4,5,6]);
    await file.write(buffer);
    expect(mockWrite).toHaveBeenCalledWith(buffer);
  });
});
