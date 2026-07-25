import { getUsers, deleteUserById } from '../../utils/userManager';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' });
  }

  const users = await getUsers();
  const user = users.find(u => u.id === id);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' });
  }

  if (users.length <= 1) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menghapus admin terakhir' });
  }

  await deleteUserById(id);

  return { success: true, message: 'User berhasil dihapus' };
});
