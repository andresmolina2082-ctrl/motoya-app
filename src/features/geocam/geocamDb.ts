import type { SQLiteDatabase } from 'expo-sqlite';
import { CreateGeoCamDTO, GeoCam, GeoCamCategory, UpdateGeoCamDTO } from './types';
import { deletePermanentPhoto } from './storage';

/**
 * Consulta la versión actual del esquema de la base de datos (PRAGMA user_version).
 */
export async function getDatabaseVersion(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return result?.user_version ?? 0;
}

/**
 * Obtiene todas las capturas GeoCam con los datos de su categoría relacionada (JOIN).
 * Soporta filtrado opcional por categoría y búsqueda por texto.
 */
export async function getAllGeoCams(
  db: SQLiteDatabase,
  categoryId?: number | null,
  searchQuery?: string,
): Promise<GeoCam[]> {
  let query = `
    SELECT 
      g.id,
      g.title,
      g.description,
      g.photo_uri,
      g.latitude,
      g.longitude,
      g.address,
      g.category_id,
      g.user_id,
      g.created_at,
      g.updated_at,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon
    FROM geocams g
    LEFT JOIN geocam_categories c ON g.category_id = c.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (categoryId !== undefined && categoryId !== null) {
    query += ` AND g.category_id = ?`;
    params.push(categoryId);
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    query += ` AND (g.title LIKE ? OR g.description LIKE ? OR g.address LIKE ?)`;
    const term = `%${searchQuery.trim()}%`;
    params.push(term, term, term);
  }

  query += ` ORDER BY g.created_at DESC;`;

  const rows = await db.getAllAsync<GeoCam>(query, ...params);
  return rows;
}

/**
 * Obtiene una captura GeoCam por su identificador.
 */
export async function getGeoCamById(db: SQLiteDatabase, id: number): Promise<GeoCam | null> {
  const query = `
    SELECT 
      g.*,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon
    FROM geocams g
    LEFT JOIN geocam_categories c ON g.category_id = c.id
    WHERE g.id = ?;
  `;
  const row = await db.getFirstAsync<GeoCam>(query, id);
  return row ?? null;
}

/**
 * Inserta una nueva captura GeoCam en la base de datos.
 */
export async function createGeoCam(db: SQLiteDatabase, dto: CreateGeoCamDTO): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO geocams (
      title,
      description,
      photo_uri,
      latitude,
      longitude,
      address,
      category_id,
      user_id,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'));`,
    dto.title,
    dto.description ?? null,
    dto.photo_uri,
    dto.latitude,
    dto.longitude,
    dto.address ?? null,
    dto.category_id ?? 1,
    dto.user_id ?? null,
  );
  return result.lastInsertRowId;
}

/**
 * Actualiza los datos de una captura GeoCam existente (Título, Descripción, Categoría).
 */
export async function updateGeoCam(
  db: SQLiteDatabase,
  id: number,
  dto: UpdateGeoCamDTO,
): Promise<void> {
  const fields: string[] = ["updated_at = datetime('now')"];
  const params: (string | number | null)[] = [];

  if (dto.title !== undefined) {
    fields.push('title = ?');
    params.push(dto.title);
  }

  if (dto.description !== undefined) {
    fields.push('description = ?');
    params.push(dto.description);
  }

  if (dto.category_id !== undefined) {
    fields.push('category_id = ?');
    params.push(dto.category_id);
  }

  params.push(id);

  await db.runAsync(`UPDATE geocams SET ${fields.join(', ')} WHERE id = ?;`, ...params);
}

/**
 * Elimina una captura GeoCam de la base de datos y borra físicamente su archivo permanente del disco.
 */
export async function deleteGeoCam(db: SQLiteDatabase, id: number): Promise<void> {
  // 1. Obtener la URI de la fotografía para borrar el archivo físico
  const record = await db.getFirstAsync<{ photo_uri: string }>(
    `SELECT photo_uri FROM geocams WHERE id = ?;`,
    id,
  );

  // 2. Eliminar el registro en la base de datos
  await db.runAsync(`DELETE FROM geocams WHERE id = ?;`, id);

  // 3. Eliminar el archivo físico permanente en el FileSystem
  if (record?.photo_uri) {
    await deletePermanentPhoto(record.photo_uri);
  }
}

/**
 * Obtiene todas las categorías disponibles con el conteo de capturas asociadas.
 */
export async function getCategories(
  db: SQLiteDatabase,
): Promise<(GeoCamCategory & { count: number })[]> {
  const query = `
    SELECT 
      c.*,
      COUNT(g.id) AS count
    FROM geocam_categories c
    LEFT JOIN geocams g ON g.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC;
  `;
  const rows = await db.getAllAsync<GeoCamCategory & { count: number }>(query);
  return rows;
}

/**
 * Crea una nueva categoría personalizada para clasificar capturas.
 */
export async function createCategory(
  db: SQLiteDatabase,
  category: { name: string; color: string; icon: string; description?: string },
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO geocam_categories (name, color, icon, description, created_at)
     VALUES (?, ?, ?, ?, datetime('now'));`,
    category.name.trim(),
    category.color,
    category.icon,
    category.description ?? null,
  );
  return result.lastInsertRowId;
}

/**
 * Elimina una categoría si no tiene capturas asociadas, o reasigna a la categoría general (1).
 */
export async function deleteCategory(db: SQLiteDatabase, id: number): Promise<void> {
  // Reasignar capturas a la categoría por defecto (id 1) antes de borrar
  await db.runAsync(`UPDATE geocams SET category_id = 1 WHERE category_id = ?;`, id);
  await db.runAsync(`DELETE FROM geocam_categories WHERE id = ?;`, id);
}
