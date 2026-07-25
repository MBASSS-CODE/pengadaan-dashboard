import bcrypt from 'bcryptjs';
import { pool } from '../../utils/db'; // Ensure we can query directly or we can use getUsers, but let's just use getUsers and updateUser
import { getUsers, updateUser } from '../../utils/userManager';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { username, password, role } = body;

  const users = await getUsers();
  const userToUpdate = users.find(u => u.id === id);

  if (!userToUpdate) {
    throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' });
  }

  if (username) {
    const existing = users.find(u => u.username === username && u.id !== id);
    if (existing) {
      throw createError({ statusCode: 400, statusMessage: 'Username sudah digunakan oleh akun lain' });
    }
    userToUpdate.username = username;
  }

  if (password) {
    userToUpdate.passwordHash = bcrypt.hashSync(password, 10);
  }

  if (role) {
    userToUpdate.role = role;
  }

  await updateUser(userToUpdate);

  return { success: true, message: 'User berhasil diperbarui' };
});
