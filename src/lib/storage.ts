import { supabase } from './supabase';

export const STORAGE_BUCKET = 'campo-files';

export const SIZE_LIMITS = {
  image: 2 * 1024 * 1024, // 2 MB (fotos, logos)
  video: 50 * 1024 * 1024, // 50 MB
  file: 5 * 1024 * 1024, // 5 MB (otros)
} as const;

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export class StorageError extends Error {}

function assertSize(file: File, max: number) {
  if (file.size > max) {
    throw new StorageError(`El archivo supera el límite de ${Math.round(max / (1024 * 1024))} MB.`);
  }
}

function assertType(file: File, allowed: string[]) {
  if (allowed.length && !allowed.includes(file.type)) {
    throw new StorageError('Tipo de archivo no permitido.');
  }
}

function safeName(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot >= 0 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, '') : '';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}

async function upload(path: string, file: File): Promise<string> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) throw new StorageError(error.message);
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPlayerPhoto(coachId: string, playerId: string, file: File): Promise<string> {
  assertType(file, IMAGE_TYPES);
  assertSize(file, SIZE_LIMITS.image);
  return upload(`photos/${coachId}/${playerId}/${safeName(file.name)}`, file);
}

export async function uploadCoachLogo(coachId: string, file: File): Promise<string> {
  assertType(file, IMAGE_TYPES);
  assertSize(file, SIZE_LIMITS.image);
  return upload(`logos/${coachId}/${safeName(file.name)}`, file);
}

/** Foto subida por el propio jugador: el 2º segmento es su auth.uid() (política Storage). */
export async function uploadMyPhoto(authUserId: string, file: File): Promise<string> {
  assertType(file, IMAGE_TYPES);
  assertSize(file, SIZE_LIMITS.image);
  return upload(`photos/${authUserId}/self/${safeName(file.name)}`, file);
}

export async function uploadVideo(coachId: string, file: File): Promise<string> {
  assertType(file, VIDEO_TYPES);
  assertSize(file, SIZE_LIMITS.video);
  return upload(`videos/${coachId}/${safeName(file.name)}`, file);
}

/** Lee un archivo como data URL (para previsualizar logos/fotos antes de subir). */
export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new StorageError('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}
