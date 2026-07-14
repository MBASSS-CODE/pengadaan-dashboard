import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { username, password, role } = body;

  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' });
  }

  if (username) {
    const existing = users.find(u => u.username === username && u.id !== id);
    if (existing) {
      throw createError({ statusCode: 400, statusMessage: 'Username sudah digunakan oleh akun lain' });
    }
    users[userIndex].username = username;
  }

  if (password) {
    users[userIndex].passwordHash = bcrypt.hashSync(password, 10);
  }

  if (role) {
    users[userIndex].role = role;
  }

  await saveUsers(users);

  return { success: true, message: 'User berhasil diperbarui' };
});
