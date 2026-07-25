import bcrypt from 'bcryptjs';
import { pool, initDB } from './db';
import { v4 as uuidv4 } from 'uuid'; // Need to import this or just use crypto

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
}

// Initialize database and create default admin if no users exist
const ensureDefaultUser = async () => {
  await initDB();
  
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    const count = (rows as any[])[0].count;
    
    if (count === 0) {
      const defaultHash = bcrypt.hashSync('aselole123123', 10);
      await pool.query(
        'INSERT INTO users (id, username, passwordHash, role) VALUES (?, ?, ?, ?)',
        ['1', 'admin', defaultHash, 'admin']
      );
      console.log('Default admin user created in MariaDB.');
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

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  const users = rows as User[];
  return users.length > 0 ? users[0] : undefined;
};

// The following functions are added to replace the old saveUsers array-based approach
export const createUser = async (user: User): Promise<void> => {
  await pool.query(
    'INSERT INTO users (id, username, passwordHash, role) VALUES (?, ?, ?, ?)',
    [user.id, user.username, user.passwordHash, user.role]
  );
};

export const updateUser = async (user: User): Promise<void> => {
  await pool.query(
    'UPDATE users SET username = ?, passwordHash = ?, role = ? WHERE id = ?',
    [user.username, user.passwordHash, user.role, user.id]
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
