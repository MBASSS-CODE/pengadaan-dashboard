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

// In-memory fallback for serverless environments (like Vercel) where FS is read-only
let memoryUsers: User[] | null = null;
const isVercel = process.env.VERCEL === '1';

const defaultHash = bcrypt.hashSync('admin123', 10);
const defaultUsers: User[] = [{ id: '1', username: 'admin', passwordHash: defaultHash, role: 'admin' }];

const ensureFile = async () => {
  if (memoryUsers) return; // Already loaded in memory

  try {
    await fs.access(usersFile);
    const data = await fs.readFile(usersFile, 'utf-8');
    memoryUsers = JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or can't be read, initialize with default
    memoryUsers = [...defaultUsers];
    try {
      if (!isVercel) {
        await fs.mkdir(path.dirname(usersFile), { recursive: true });
        await fs.writeFile(usersFile, JSON.stringify(memoryUsers, null, 2), 'utf-8');
      }
    } catch (writeErr) {
      console.warn('Vercel/Serverless Environment detected or FS is Read-Only. Using in-memory users storage.');
    }
  }
};

export const getUsers = async (): Promise<User[]> => {
  await ensureFile();
  return memoryUsers || defaultUsers;
};

export const saveUsers = async (users: User[]) => {
  memoryUsers = users;
  try {
    if (!isVercel) {
      await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8');
    }
  } catch (error) {
    console.warn('Failed to save users to disk, using in-memory only.', error);
  }
};

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find(u => u.username === username);
};
