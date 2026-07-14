export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  
  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' });
  }

  if (users.length <= 1) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menghapus admin terakhir' });
  }

  users.splice(userIndex, 1);
  await saveUsers(users);

  return { success: true, message: 'User berhasil dihapus' };
});
