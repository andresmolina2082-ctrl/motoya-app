// Backend de MotoYa: hace de intermediario entre la app y la API de Gemini.
// La API key vive solo aquí (server/.env) y nunca se envía a la app.
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3001);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';

// Si un modelo está saturado (503/429) se prueba el siguiente de la lista
const MODELS = (process.env.GEMINI_MODELS ?? 'gemini-3.8-flash,gemini-3.5-flash,gemini-3.1-flash-lite')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

const MAX_MESSAGES = 40;
const MAX_TEXT_LENGTH = 4000;
const MAX_BODY_BYTES = 200_000;
const REQUEST_TIMEOUT_MS = 30_000;

if (!GEMINI_API_KEY) {
  console.error('Falta GEMINI_API_KEY. Copia server/.env.example a server/.env y pon tu key.');
  process.exit(1);
}

function systemInstruction(user) {
  const who = user?.name
    ? `Estás hablando con ${user.name}, que usa la app como ${user.role === 'driver' ? 'mototaxista' : 'pasajero'}.`
    : '';
  return [
    'Eres MOTO IA, el asistente con inteligencia artificial de MotoYa, una app de mototaxis en Riohacha, La Guajira (Colombia).',
    'En MotoYa los pasajeros proponen la tarifa de su carrera y los mototaxistas aceptan o hacen contraofertas; se paga en efectivo, Nequi o Daviplata.',
    'Puedes ayudar con cualquier tipo de petición: dudas de la app, rutas y lugares, consejos de seguridad vial, redactar textos, explicar temas, cálculos o conversación general.',
    'Responde en el idioma del usuario (español por defecto), de forma clara y breve, apta para leer en el celular. Escribe en texto plano, sin Markdown (nada de **, #, ni tablas); para listas usa guiones simples. No inventes datos de carreras, precios o conductores reales que no tengas.',
    who,
  ].join(' ');
}

function toGeminiInput(messages) {
  return messages.map((m) => ({
    type: m.role === 'model' ? 'model_output' : 'user_input',
    content: [{ type: 'text', text: m.text }],
  }));
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return 'Envía al menos un mensaje';
  if (messages.length > MAX_MESSAGES) return `Máximo ${MAX_MESSAGES} mensajes por conversación`;
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'model')) return 'Cada mensaje debe tener role "user" o "model"';
    if (typeof m.text !== 'string' || !m.text.trim()) return 'Hay un mensaje vacío';
    if (m.text.length > MAX_TEXT_LENGTH) return `Cada mensaje puede tener máximo ${MAX_TEXT_LENGTH} caracteres`;
  }
  if (messages.at(-1).role !== 'user') return 'El último mensaje debe ser del usuario';
  return null;
}

// Modelos que fallaron por saturación se saltan un rato para no perder tiempo en cada petición
const MODEL_COOLDOWN_MS = 2 * 60_000;
const cooldownUntil = new Map();

function modelsToTry() {
  const now = Date.now();
  const available = MODELS.filter((m) => (cooldownUntil.get(m) ?? 0) <= now);
  return available.length ? available : MODELS;
}

async function askGemini(messages, user) {
  let lastError;
  for (const model of modelsToTry()) {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        model,
        store: false,
        system_instruction: systemInstruction(user),
        input: toGeminiInput(messages),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }).catch((e) => ({ ok: false, status: 0, networkError: e }));

    if (res.ok) {
      const data = await res.json();
      const reply = (data.steps ?? [])
        .filter((s) => s.type === 'model_output')
        .flatMap((s) => s.content ?? [])
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('\n')
        .trim();
      if (reply) return { reply, model };
      lastError = new Error(`Respuesta vacía de ${model}`);
      continue;
    }

    const detail = res.networkError?.message ?? (await res.text().catch(() => ''));
    lastError = new Error(`${model} respondió ${res.status}: ${detail.slice(0, 300)}`);
    // Solo vale la pena reintentar con otro modelo si el problema es de capacidad o de red
    const retryable = res.status === 0 || res.status === 429 || res.status >= 500 || res.status === 404;
    if (!retryable) break;
    cooldownUntil.set(model, Date.now() + MODEL_COOLDOWN_MS);
  }
  throw lastError;
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Petición demasiado grande'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('JSON inválido'), { status: 400 });
  }
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204);

  if (req.method === 'GET' && req.url === '/api/health') {
    return send(res, 200, { ok: true, models: MODELS });
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    try {
      const { messages, user } = await readJson(req);
      const invalid = validateMessages(messages);
      if (invalid) return send(res, 400, { error: invalid });

      const started = Date.now();
      const result = await askGemini(messages, user);
      console.log(`[chat] ${result.model} · ${Date.now() - started} ms · ${messages.length} mensajes`);
      return send(res, 200, result);
    } catch (e) {
      if (e.status) return send(res, e.status, { error: e.message });
      console.error('[chat] error:', e.message);
      return send(res, 502, { error: 'MOTO IA no está disponible en este momento. Intenta de nuevo en un momento.' });
    }
  }

  send(res, 404, { error: 'Ruta no encontrada' });
});

// 0.0.0.0 para que un celular en la misma red Wi-Fi pueda conectarse
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MotoYa backend en http://localhost:${PORT} · modelos: ${MODELS.join(' → ')}`);
});
