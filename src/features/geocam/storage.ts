import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const DIR_NAME = 'geocam_photos/';

/**
 * Obtiene el directorio permanente para almacenar las fotos GeoCam.
 */
export function getGeoCamDirectory(): string | null {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return null;
  }
  return `${FileSystem.documentDirectory}${DIR_NAME}`;
}

/**
 * Asegura que el directorio permanente exista en el almacenamiento de la aplicación.
 */
export async function ensureDirectoryExists(): Promise<string | null> {
  const dir = getGeoCamDirectory();
  if (!dir) return null;

  try {
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    return dir;
  } catch (error) {
    console.warn('[storage] Error asegurando directorio permanente:', error);
    return null;
  }
}

/**
 * Guarda una fotografía temporalmente capturada en el directorio permanente de documentos.
 * Retorna la URI permanente (file://...).
 */
export async function savePermanentPhoto(tempUri: string): Promise<string> {
  // En plataforma web no hay sistema de archivos nativo, conservamos la URI original
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return tempUri;
  }

  try {
    const dir = await ensureDirectoryExists();
    if (!dir) return tempUri;

    // Generar un nombre único para el archivo permanente
    const extension = tempUri.split('.').pop()?.split('?')[0] || 'jpg';
    const filename = `geocam_${Date.now()}_${Math.floor(Math.random() * 100000)}.${extension}`;
    const permanentUri = `${dir}${filename}`;

    // Copiar el archivo desde la caché temporal hacia la carpeta permanente del sistema de archivos
    await FileSystem.copyAsync({
      from: tempUri,
      to: permanentUri,
    });

    console.log('[storage] Archivo guardado permanentemente en:', permanentUri);
    return permanentUri;
  } catch (error) {
    console.error('[storage] Error al guardar archivo permanente:', error);
    // Si falla la copia, retornamos la URI temporal como respaldo
    return tempUri;
  }
}

/**
 * Elimina físicamente el archivo del almacenamiento permanente.
 */
export async function deletePermanentPhoto(photoUri: string): Promise<void> {
  if (Platform.OS === 'web' || !photoUri.startsWith('file://')) {
    return;
  }

  try {
    const info = await FileSystem.getInfoAsync(photoUri);
    if (info.exists) {
      await FileSystem.deleteAsync(photoUri, { idempotent: true });
      console.log('[storage] Archivo permanente eliminado del disco:', photoUri);
    }
  } catch (error) {
    console.warn('[storage] Error al eliminar archivo permanente:', error);
  }
}

/**
 * Inspecciona información del archivo físico (tamaño, existencia).
 */
export async function getFileInfo(photoUri: string): Promise<{ exists: boolean; size?: number }> {
  if (Platform.OS === 'web' || !photoUri.startsWith('file://')) {
    return { exists: true };
  }

  try {
    const info = await FileSystem.getInfoAsync(photoUri);
    return {
      exists: info.exists,
      size: info.exists && 'size' in info ? info.size : undefined,
    };
  } catch {
    return { exists: false };
  }
}
