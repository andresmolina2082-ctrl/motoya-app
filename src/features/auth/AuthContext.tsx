import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from 'expo-sqlite';

export type UserRole = 'client' | 'driver';

export type StoredUser = {
  id: string;
  name: string;
  phone: string;
  password?: string;
  role: UserRole;
  motoModel?: string;
  plate?: string;
};

export type SessionUser = Omit<StoredUser, 'password'>;

type RegisterInput = {
  name: string;
  phone: string;
  password?: string;
  role: UserRole;
  motoModel?: string;
  plate?: string;
};

type AuthContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  login: (phone: string, password: string | undefined, role: UserRole) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  listDrivers: () => Promise<SessionUser[]>;
  getDriverById: (id: string) => Promise<SessionUser | null>;
};

const SESSION_KEY = '@motoya/session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Fila tal como sale de la tabla `users` (ver src/db/database.ts)
type UserRow = {
  id: string;
  name: string;
  phone: string;
  password: string | null;
  role: UserRole;
  moto_model: string | null;
  plate: string | null;
};

const USER_COLUMNS = 'id, name, phone, password, role, moto_model, plate';

function fromRow(row: UserRow): StoredUser {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    password: row.password ?? undefined,
    role: row.role,
    motoModel: row.moto_model ?? undefined,
    plate: row.plate ?? undefined,
  };
}

function toSessionUser(user: StoredUser): SessionUser {
  const { password: _password, ...session } = user;
  return session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw) as SessionUser);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (phone: string, password: string | undefined, role: UserRole) => {
    const normalizedPhone = phone.trim();
    if (!normalizedPhone) {
      throw new Error('Ingresa tu teléfono');
    }
    if (role === 'driver' && !password) {
      throw new Error('Ingresa tu contraseña');
    }

    const row = await db.getFirstAsync<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users WHERE phone = ?`,
      normalizedPhone,
    );
    if (!row) {
      throw new Error('No existe una cuenta con ese teléfono');
    }
    const found = fromRow(row);
    if (found.role !== role) {
      throw new Error(
        found.role === 'driver'
          ? 'Ese teléfono está registrado como Mototaxista'
          : 'Ese teléfono está registrado como Pasajero',
      );
    }
    if (found.role === 'driver' && found.password !== password) {
      throw new Error('Contraseña incorrecta');
    }

    const session = toSessionUser(found);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  }, [db]);

  const register = useCallback(async (input: RegisterInput) => {
    const normalizedPhone = input.phone.trim();
    if (!input.name.trim() || !normalizedPhone) {
      throw new Error('Completa nombre y teléfono');
    }
    if (input.role === 'driver' && !input.password) {
      throw new Error('Crea una contraseña para tu cuenta de mototaxista');
    }
    if (input.role === 'driver' && (!input.motoModel?.trim() || !input.plate?.trim())) {
      throw new Error('Completa el modelo de moto y la placa');
    }

    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM users WHERE phone = ?',
      normalizedPhone,
    );
    if (existing) {
      throw new Error('Ya existe una cuenta con ese teléfono');
    }

    const newUser: StoredUser = {
      id: `${input.role === 'driver' ? 'DRV' : 'CLI'}-${Date.now()}`,
      name: input.name.trim(),
      phone: normalizedPhone,
      password: input.role === 'driver' ? input.password : undefined,
      role: input.role,
      motoModel: input.motoModel?.trim() || undefined,
      plate: input.plate?.trim() || undefined,
    };

    await db.runAsync(
      `INSERT INTO users (${USER_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      newUser.id,
      newUser.name,
      newUser.phone,
      newUser.password ?? null,
      newUser.role,
      newUser.motoModel ?? null,
      newUser.plate ?? null,
    );

    const session = toSessionUser(newUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  }, [db]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const listDrivers = useCallback(async () => {
    const rows = await db.getAllAsync<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users WHERE role = 'driver' ORDER BY created_at DESC`,
    );
    return rows.map((row) => toSessionUser(fromRow(row)));
  }, [db]);

  const getDriverById = useCallback(
    async (id: string) => {
      const row = await db.getFirstAsync<UserRow>(
        `SELECT ${USER_COLUMNS} FROM users WHERE id = ? AND role = 'driver'`,
        id,
      );
      return row ? toSessionUser(fromRow(row)) : null;
    },
    [db],
  );

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, listDrivers, getDriverById }),
    [user, isLoading, login, register, logout, listDrivers, getDriverById],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
