import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'motoya.db';

export const DATABASE_VERSION = 2;

// Clave donde se guardaban los usuarios antes de usar SQLite
const LEGACY_USERS_KEY = '@motoya/users';

type LegacyUser = {
  id: string;
  name: string;
  phone: string;
  password?: string;
  role: 'client' | 'driver';
  motoModel?: string;
  plate?: string;
};

/**
 * Crea o actualiza el esquema según PRAGMA user_version.
 * Versión 1: Tabla de usuarios y tabla base de capturas GeoCam.
 * Versión 2 (Segunda migración): Módulo relacional con tabla `geocam_categories` y FK `category_id` en `geocams`.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = result?.user_version ?? 0;
  if (version >= DATABASE_VERSION) return;

  // --- MIGRACIÓN 1: Esquema base (Usuarios y GeoCam original) ---
  if (version < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        password TEXT,
        role TEXT NOT NULL CHECK (role IN ('client', 'driver')),
        moto_model TEXT,
        plate TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

      -- Tabla inicial GeoCam persistente
      CREATE TABLE IF NOT EXISTS geocams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        photo_uri TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    await importLegacyUsers(db);
    version = 1;
  }

  // --- MIGRACIÓN 2 (SEGUNDA MIGRACIÓN): Relaciones y Categorías ---
  if (version < 2) {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      -- 1. Tabla de Categorías relacionadas para GeoCam
      CREATE TABLE IF NOT EXISTS geocam_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- 2. Semilla de categorías iniciales para la aplicación urbana y de movilidad
      INSERT OR IGNORE INTO geocam_categories (id, name, color, icon, description) VALUES
        (1, 'Inspección de Moto', '#00C853', 'shield-checkmark', 'Verificación de cascos reglamentarios y estado de la moto'),
        (2, 'Punto de Recogida', '#0284C7', 'location', 'Paraderos y zonas seguras para recoger pasajeros'),
        (3, 'Incidente Vial', '#EF4444', 'alert-circle', 'Baches, desvíos o novedades en la vía pública'),
        (4, 'Documentación SOAT', '#F59E0B', 'document-text', 'Fotos de tecnomecánica, tarjeta y póliza SOAT'),
        (5, 'General / Carrera', '#8B5CF6', 'navigate', 'Fotografías generales de recorridos y entregas');
    `);

    // Asegurar que la tabla geocams existe en caso de haber migrado desde una BD v1 preexistente
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS geocams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        photo_uri TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // 3. Agregar columnas de relación si no existen aún (ALTER TABLE)
    const tableInfo = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(geocams);`);
    const columnNames = new Set(tableInfo.map((col) => col.name));

    if (!columnNames.has('category_id')) {
      await db.execAsync(`
        ALTER TABLE geocams ADD COLUMN category_id INTEGER REFERENCES geocam_categories(id) DEFAULT 1;
        CREATE INDEX IF NOT EXISTS idx_geocams_category ON geocams(category_id);
      `);
    }

    if (!columnNames.has('user_id')) {
      await db.execAsync(`
        ALTER TABLE geocams ADD COLUMN user_id TEXT REFERENCES users(id);
        CREATE INDEX IF NOT EXISTS idx_geocams_user ON geocams(user_id);
      `);
    }

    version = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${version}`);
}

// Copia los usuarios que estaban en AsyncStorage para no perder cuentas ya registradas
async function importLegacyUsers(db: SQLiteDatabase) {
  const raw = await AsyncStorage.getItem(LEGACY_USERS_KEY);
  if (!raw) return;

  const users = JSON.parse(raw) as LegacyUser[];
  await db.withTransactionAsync(async () => {
    for (const u of users) {
      await db.runAsync(
        `INSERT OR IGNORE INTO users (id, name, phone, password, role, moto_model, plate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        u.id,
        u.name,
        u.phone,
        u.password ?? null,
        u.role,
        u.motoModel ?? null,
        u.plate ?? null,
      );
    }
  });
  await AsyncStorage.removeItem(LEGACY_USERS_KEY);
}
