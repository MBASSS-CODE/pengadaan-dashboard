import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password, role } = body;

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username dan password wajib diisi' });
  }

  // Gunakan fungsi auto-import
  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    throw createError({ statusCode: 400, statusMessage: 'Username sudah digunakan' });
  }

  const users = await getUsers();
  const newUser = {
    id: Date.now().toString(),
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role || 'admin'
  };

  users.push(newUser);
  await saveUsers(users);

  return { 
    success: true, 
    data: { id: newUser.id, username: newUser.username, role: newUser.role } 
  };
});
