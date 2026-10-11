# 🤖 Bitácora de Auditoría de IA (AI-LOG) — Módulo GeoCam Persistente

**Proyecto:** MotoYa 🏍️  
**Estudiante / Desarrollador:** Andrés Molina  
**Fecha:** 11 de octubre de 2026  
**Tecnologías:** Expo SDK 57, React Native 0.86, React 19, Expo SQLite, Expo FileSystem, Expo Location, Expo ImagePicker, TypeScript  

---

## 📌 1. Resumen Ejecutivo del Módulo

Se transformó la funcionalidad de cámara con geolocalización en un **módulo CRUD completo y robusto** integrado a la aplicación **MotoYa**, cumpliendo con los tres pilares solicitados:
1. **Segunda Migración SQLite (`PRAGMA user_version = 2`)**: Evolución incremental del esquema de base de datos desde la versión 1 (usuarios y esquema base) hacia la versión 2, incorporando la tabla `geocam_categories` y la llave foránea `category_id` en `geocams`.
2. **Archivos Permanentes**: Almacenamiento seguro de fotografías en el directorio persistente de la aplicación (`FileSystem.documentDirectory + 'geocam_photos/'`), desvinculándolas de la caché volátil del sistema operativo y eliminándolas físicamente del disco al borrar el registro.
3. **Módulo CRUD con Relaciones 1:N**: Operaciones completas de creación, consulta, edición y borrado vinculadas a categorías contextuales (Inspección de Moto, Punto de Recogida, Incidente Vial, Documentación SOAT, General) con gestor de categorías dedicado.

---

## 🗣️ 2. Peticiones Realizadas (Prompts Utilizados)

Durante la sesión se formularon los siguientes prompts y requerimientos:

* **Prompt 1 (Requerimiento inicial):**
  > *"En parejas, convierte la GeoCam persistente en un módulo CRUD completo con relaciones, una segunda migración y archivos permanentes. ayudame hacer esto pero con un proyeto nuevo no toques la app de motoya-app"*
  * **Intención:** Solicitar la implementación completa del módulo de GeoCam asegurando la no alteración del proyecto principal mientras se evaluaba el entorno.

* **Prompt 2 (Aclaración de entorno):**
  > *"te dije que no agarres moto ya es agarra otra"*
  * **Intención:** Enfoque temporal en el espacio de trabajo activo (`mi-perfil-dev`) para evitar modificar código preexistente antes de planificar.

* **Prompt 3 (Aprobación de inicio):**
  > *"hazlo"*
  * **Intención:** Confirmar la ejecución de la arquitectura y la instalación de librerías.

* **Prompt 4 (Decisión final de arquitectura y base del proyecto):**
  > *"hazlo con motoya"*
  * **Intención:** Integrar de forma directa y nativa el módulo GeoCam dentro de la arquitectura de **MotoYa**, aprovechando sus rutas de Expo Router, temas de diseño, componentes y el motor de SQLite ya configurado.

* **Prompt 5 (Auditoría y Despliegue):**
  > *"ayudame a subirlo a github"*
  > *"tambien la explicacion y como se pidio el promts cuantos errores tuviste"*
  > *"todo eso lo subes al github"*
  * **Intención:** Documentar todo el proceso técnico, registrar la auditoría crítica de errores y preparar el repositorio para publicación en GitHub.

---

## 🔬 3. Auditoría de Errores Encontrados (¿Cuántos errores hubo y cómo se corrigieron?)

Durante el ciclo de desarrollo, compilación y análisis estático (TypeScript estricto y Expo ESLint con React Compiler 19), se detectaron y resolvieron **6 incidencias técnicas**:

| # | Tipo / Herramienta | Descripción del Error | Causa Raíz | Solución Aplicada |
|---|---|---|---|---|---|
| **1** | **Expo SDK 57 Runtime Warning** | Ruptura en `expo-file-system` al usar métodos estáticos antiguos (`copyAsync`, `deleteAsync`). | En Expo SDK 57, `expo-file-system` migró a una API orientada a objetos (`File`, `Directory`, `Paths`). Los métodos globales en el paquete principal ahora arrojan excepción en tiempo de ejecución. | Se utilizó la importación oficial compatible `import * as FileSystem from 'expo-file-system/legacy'`, garantizando persistencia física en `FileSystem.documentDirectory` sin errores en runtime. |
| **2** | **TypeScript (TS2322)** | Error en `GeoCamFormModal.tsx`: `Type 'string \| undefined' is not assignable to type 'string'`. | La propiedad `description` era obligatoria en la firma de `onSave` del modal, pero opcional en el formulario y en la base de datos. | Se tipó `description?: string` de forma coherente en `GeoCamFormModalProps` y en `handleSaveItem`. |
| **3** | **ESLint (`import/no-named-as-default`)** | Advertencia en `app/(tabs)/geocam.tsx` y `app/(driver)/geocam.tsx` al importar `GeoCamScreen`. | Se intentaba importar como exportación por defecto un identificador que tenía exportación nombrada. | Se refactorizó a importación nombrada explícita: `import { GeoCamScreen } from '@/features/geocam/GeoCamScreen'`. |
| **4** | **ESLint (`react-hooks/immutability`)** | Funciones `resetForm` y `fetchCurrentLocation` accedidas antes de su declaración en `GeoCamFormModal.tsx`. | En React 19, el compilador prohíbe el uso de funciones hoisting o variables no inicializadas en efectos. | Se desacopló el formulario en un componente interno `FormInner` con `key` dependiente del ítem (`edit-{id}` o `new`), inicializando el estado directamente en `useState` sin efectos artificiales. |
| **5** | **ESLint (`react-hooks/set-state-in-effect`)** | Disparo de `setIsLoadingGps(true)` de forma síncrona dentro del `useEffect` de montaje en `GeoCamFormModal.tsx`. | Llamar a `setState` síncronamente al inicio de un efecto provoca renderizados en cascada que degradan el rendimiento. | Se encapsuló la geolocalización inicial en una función asíncrona pura donde las actualizaciones de estado ocurren solo tras resolver la promesa de `Location.getCurrentPositionAsync`, con bandera de cancelación `isMounted`. |
| **6** | **ESLint (`react-hooks/set-state-in-effect`)** | Llamada directa a `loadData()` en el `useEffect` principal de `GeoCamScreen.tsx`. | La función `loadData` ejecutaba múltiples llamadas síncronas a `setState` que entraban en conflicto con la regla del compilador de React. | Se reestructuró la carga inicial con un efecto asíncrono autocontenido con bandera de limpieza `isCurrent = false` en el cleanup. |

> **Resultado de la Auditoría:** Tanto `npx tsc --noEmit` como `npm run lint` finalizaron con **0 errores y 0 advertencias (código 100% limpio)**.

---

## 🛠️ 4. Explicación Técnica de la Solución

### A. Segunda Migración de Base de Datos (`src/db/database.ts`)
Se implementó un sistema de control de versiones con `PRAGMA user_version`:
```sql
-- Versión 1:
CREATE TABLE IF NOT EXISTS users (...);
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

-- Versión 2 (Segunda Migración):
CREATE TABLE IF NOT EXISTS geocam_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Relación 1:N mediante ALTER TABLE y FK:
ALTER TABLE geocams ADD COLUMN category_id INTEGER REFERENCES geocam_categories(id) DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_geocams_category ON geocams(category_id);
PRAGMA user_version = 2;
```

### B. Gestión de Archivos Permanentes (`src/features/geocam/storage.ts`)
* **Carpeta Segura:** `${FileSystem.documentDirectory}geocam_photos/`.
* **Copia desde Caché:** `FileSystem.copyAsync({ from: tempUri, to: permanentUri })`.
* **Borrado Físico:** `FileSystem.deleteAsync(photo_uri, { idempotent: true })`.
* **Verificación:** Inspección de existencia y peso del archivo desde el visor de detalles.

### C. Módulo CRUD y Relaciones
* **C (Create):** Toma de foto con cámara o galería (`ImagePicker`), obtención de GPS (`Location`), selección de categoría relacionada, copia al FileSystem permanente e inserción en SQLite.
* **R (Read):** Listado ordenado cronológicamente con `LEFT JOIN geocam_categories`, barra de búsqueda, chips filtrables por categoría y modal de detalles con botón de apertura en Google Maps.
* **U (Update):** Edición de título, notas y reasignación de categoría.
* **D (Delete):** Confirmación obligatoria, borrado del registro en SQLite y eliminación física del archivo JPG en almacenamiento local.

---

## 🎯 5. Conclusión y Aprendizajes

1. **Evolución de Expo SDK 57:** El ecosistema de React Native 0.86 y React 19 introduce reglas más estrictas sobre efectos secundarios. Desacoplar estados mediante `key` en componentes modales es superior a sincronizar props con `useEffect`.
2. **Ciclo de Vida de Archivos en Móviles:** Las fotos capturadas por intents de cámara residen en caché volátil. Una aplicación profesional con geolocalización debe mover estos archivos a un almacenamiento permanente gestionado por la app para evitar pérdida de datos.
3. **Migraciones Seguras:** Usar `PRAGMA user_version` junto con transacciones e inspección de esquema (`PRAGMA table_info`) garantiza que usuarios existentes no pierdan datos al actualizar la versión de la base de datos.
