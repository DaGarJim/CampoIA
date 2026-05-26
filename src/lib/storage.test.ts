import { describe, expect, it } from 'vitest';
import { StorageError, uploadCoachLogo, uploadPlayerPhoto, uploadVideo } from './storage';

function fakeFile(name: string, type: string, size: number): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('storage: validación previa a la subida', () => {
  it('rechaza tipos de imagen no permitidos', async () => {
    const gif = fakeFile('a.gif', 'image/gif', 1000);
    await expect(uploadPlayerPhoto('c', 'p', gif)).rejects.toBeInstanceOf(StorageError);
  });

  it('rechaza imágenes que superan 2 MB', async () => {
    const big = fakeFile('a.png', 'image/png', 3 * 1024 * 1024);
    await expect(uploadCoachLogo('c', big)).rejects.toThrow(/límite/i);
  });

  it('rechaza vídeos que superan 50 MB', async () => {
    const big = fakeFile('a.mp4', 'video/mp4', 60 * 1024 * 1024);
    await expect(uploadVideo('c', big)).rejects.toBeInstanceOf(StorageError);
  });

  it('rechaza un vídeo con tipo de imagen', async () => {
    const wrong = fakeFile('a.png', 'image/png', 1000);
    await expect(uploadVideo('c', wrong)).rejects.toBeInstanceOf(StorageError);
  });
});
