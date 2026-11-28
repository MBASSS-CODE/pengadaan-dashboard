import bcrypt from 'bcryptjs';
import { getUsers, updateUser } from '../../utils/userManager';
import { loadPpkMaster } from '../../utils/ppkManager';
import { isAdminOrDeveloper, isDeveloper, isPpk, isValidRole } from '../../../shared/utils/roles';

export default defineEventHandler(async (event) => {
  const actorRole = event.context.user?.role as string | undefined;
  if (!isAdminOrDeveloper(actorRole)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Anda tidak memiliki akses' });
  }

  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { username, password, role, ppk_master_id, must_change_password } = body || {};

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

  if (isPpk(userToUpdate.role)) {
    const candidatePpkId = ppk_master_id !== undefined ? ppk_master_id : userToUpdate.ppk_master_id;
    const parsedId = Number(candidatePpkId);
    if (!candidatePpkId || !Number.isFinite(parsedId)) {
      throw createError({ statusCode: 400, statusMessage: 'Akun PPK wajib terhubung ke data Master PPK' });
    }
    const ppkList = await loadPpkMaster();
    const ppkExists = ppkList.some((p: any) => Number(p.id) === parsedId);
    if (!ppkExists) {
      throw createError({ statusCode: 400, statusMessage: 'Data PPK tidak ditemukan di Master PPK' });
    }
    userToUpdate.ppk_master_id = parsedId;
  } else {
    userToUpdate.ppk_master_id = null;
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

  if (must_change_password !== undefined) {
    userToUpdate.must_change_password = must_change_password ? 1 : 0;
  } else if (password) {
    userToUpdate.must_change_password = 0;
  }

  await updateUser(userToUpdate);

  return { success: true, message: 'User berhasil diperbarui' };
});
