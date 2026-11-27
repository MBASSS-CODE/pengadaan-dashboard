import bcrypt from 'bcryptjs';
import { getUsers, updateUser } from '../../utils/userManager';
import { isAdminOrDeveloper, isDeveloper, isValidRole } from '../../../shared/utils/roles';

export default defineEventHandler(async (event) => {
  const actorRole = event.context.user?.role as string | undefined;
  if (!isAdminOrDeveloper(actorRole)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Anda tidak memiliki akses' });
  }

  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { username, password, role } = body || {};

  const users = await getUsers();
  const userToUpdate = users.find(u => u.id === id);

  if (!userToUpdate) {
    throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' });
  }

  if (isDeveloper(userToUpdate.role) && !isDeveloper(actorRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin tidak diizinkan mengubah akun developer'
    });
  }

  if (role !== undefined) {
    if (!isValidRole(role)) {
      throw createError({ statusCode: 400, statusMessage: 'Role tidak valid' });
    }
    if (isDeveloper(role) && !isDeveloper(actorRole)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Hanya developer yang dapat menetapkan role developer'
      });
    }
    if (isDeveloper(userToUpdate.role) && !isDeveloper(role)) {
      const developerCount = users.filter(u => isDeveloper(u.role)).length;
      if (developerCount <= 1) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Tidak bisa menurunkan role akun developer terakhir'
        });
      }
    }
    userToUpdate.role = role;
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
    userToUpdate.must_change_password = 0;
  }

  await updateUser(userToUpdate);

  return { success: true, message: 'User berhasil diperbarui' };
});
