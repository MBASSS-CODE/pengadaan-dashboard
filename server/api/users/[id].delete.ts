import { getUsers, deleteUserById } from '../../utils/userManager';
import { isAdminOrDeveloper, isDeveloper } from '../../../shared/utils/roles';

export default defineEventHandler(async (event) => {
  const actor = event.context.user as { id?: string; role?: string } | undefined;
  if (!isAdminOrDeveloper(actor?.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Anda tidak memiliki akses' });
  }

  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' });
  }

  if (actor?.id === id) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak dapat menghapus akun yang sedang digunakan' });
  }

  const users = await getUsers();
  const user = users.find(u => u.id === id);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' });
  }

  if (isDeveloper(user.role) && !isDeveloper(actor?.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin tidak diizinkan menghapus akun developer'
    });
  }

  if (isDeveloper(user.role)) {
    const developerCount = users.filter(u => isDeveloper(u.role)).length;
    if (developerCount <= 1) {
      throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menghapus developer terakhir' });
    }
  }

  if (users.length <= 1) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menghapus pengguna terakhir' });
  }

  await deleteUserById(id);

  return { success: true, message: 'User berhasil dihapus' };
});
