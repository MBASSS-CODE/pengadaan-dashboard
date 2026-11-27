import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { pool, initDB } from './db';
import type { UserRole } from '../../shared/utils/roles';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole | string;
  must_change_password?: number | boolean;
}

export const getDefaultDevCredentials = () => ({
  username: process.env.DEFAULT_DEV_USERNAME || 'developer',
  password: process.env.DEFAULT_DEV_PASSWORD || 'developer123'
});

// Initialize database and ensure default admin & developer accounts exist
const ensureDefaultUser = async () => {
  await initDB();
  
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    const count = (rows as any[])[0].count;
    
    if (count === 0) {
      const defaultHash = bcrypt.hashSync('aselole123123', 10);
      await pool.query(
        'INSERT INTO users (id, username, passwordHash, role, must_change_password) VALUES (?, ?, ?, ?, ?)',
        ['1', 'admin', defaultHash, 'admin', 0]
      );
      console.log('Default admin user created in MariaDB.');
    }

    const [devRows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['developer']);
    const devCount = (devRows as any[])[0].count;

    if (devCount === 0) {
      const devCreds = getDefaultDevCredentials();
      const existingByUsername = await findUserByUsername(devCreds.username);
      const targetUsername = existingByUsername
        ? `${devCreds.username}_${crypto.randomBytes(2).toString('hex')}`
        : devCreds.username;
      const devHash = bcrypt.hashSync(devCreds.password, 10);

      await pool.query(
        'INSERT INTO users (id, username, passwordHash, role, must_change_password) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), targetUsername, devHash, 'developer', 1]
      );
      console.warn(
        `[Auth] Default developer user "${targetUsername}" created. Wajib mengganti password default saat login pertama.`
      );
    }
  } catch (error) {
    console.error('Error ensuring default user:', error);
  }
};

// Call initialization
ensureDefaultUser();

export const getUsers = async (): Promise<User[]> => {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows as User[];
};

export const findUserById = async (id: string): Promise<User | undefined> => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  const users = rows as User[];
  return users.length > 0 ? users[0] : undefined;
};

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  const users = rows as User[];
  return users.length > 0 ? users[0] : undefined;
};

export const createUser = async (user: User): Promise<void> => {
  await pool.query(
    'INSERT INTO users (id, username, passwordHash, role, must_change_password) VALUES (?, ?, ?, ?, ?)',
    [user.id, user.username, user.passwordHash, user.role, user.must_change_password ? 1 : 0]
  );
};

export const updateUser = async (user: User): Promise<void> => {
  await pool.query(
    'UPDATE users SET username = ?, passwordHash = ?, role = ?, must_change_password = ? WHERE id = ?',
    [user.username, user.passwordHash, user.role, user.must_change_password ? 1 : 0, user.id]
  );
};

export const updateUserPassword = async (
  id: string,
  passwordHash: string,
  mustChangePassword: boolean = false
): Promise<void> => {
  await pool.query(
    'UPDATE users SET passwordHash = ?, must_change_password = ? WHERE id = ?',
    [passwordHash, mustChangePassword ? 1 : 0, id]
  );
};

export const deleteUserById = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
};

// Keep this for backwards compatibility, but it should preferably not be used
export const saveUsers = async (users: User[]) => {
  console.warn('saveUsers is deprecated. Use createUser, updateUser, or deleteUserById instead.');
  for (const user of users) {
    await pool.query(
      'INSERT INTO users (id, username, passwordHash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE username=VALUES(username), passwordHash=VALUES(passwordHash), role=VALUES(role)',
      [user.id, user.username, user.passwordHash, user.role]
    );
  }
};
