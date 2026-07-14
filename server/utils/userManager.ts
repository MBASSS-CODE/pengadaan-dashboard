import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

const usersFile = path.resolve(process.cwd(), 'server/data/users.json');

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
}

const ensureFile = async () => {
  try {
    await fs.access(usersFile);
  } catch {
    await fs.mkdir(path.dirname(usersFile), { recursive: true });
    // Default admin user: admin / admin123
    const defaultHash = bcrypt.hashSync('admin123', 10);
    const defaultUsers: User[] = [{ id: '1', username: 'admin', passwordHash: defaultHash, role: 'admin' }];
    await fs.writeFile(usersFile, JSON.stringify(defaultUsers, null, 2), 'utf-8');
  }
};

export const getUsers = async (): Promise<User[]> => {
  await ensureFile();
  const data = await fs.readFile(usersFile, 'utf-8');
  return JSON.parse(data);
};

export const saveUsers = async (users: User[]) => {
  await ensureFile();
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8');
};

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find(u => u.username === username);
};
