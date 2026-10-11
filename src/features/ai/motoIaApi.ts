import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { SessionUser } from '@/features/auth/AuthContext';

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

const API_PORT = 3001;
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * URL del backend (server/index.mjs).
 * - EXPO_PUBLIC_API_URL si está definida (p. ej. cuando el backend esté desplegado).
 * - En desarrollo usa la misma IP del computador donde corre `expo start`,
 *   así funciona en web, en el emulador y en un celular en la misma red Wi-Fi.
 */
function getApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'web') return `http://${window.location.hostname}:${API_PORT}`;

  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (devHost) return `http://${devHost}:${API_PORT}`;
  return Platform.OS === 'android' ? `http://10.0.2.2:${API_PORT}` : `http://localhost:${API_PORT}`;
}

export async function sendChat(messages: ChatMessage[], user: SessionUser | null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${getApiUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        user: user ? { name: user.name, role: user.role } : undefined,
      }),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
    if (!res.ok || !data.reply) {
      throw new Error(data.error ?? 'MOTO IA no pudo responder. Intenta de nuevo.');
    }
    return data.reply;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('MOTO IA tardó demasiado en responder. Intenta de nuevo.');
    }
    if (e instanceof TypeError) {
      throw new Error('No hay conexión con el servidor de MOTO IA. ¿Está corriendo `npm run server`?');
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}
