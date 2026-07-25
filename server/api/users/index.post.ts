import bcrypt from 'bcryptjs';
import { findUserByUsername, createUser } from '../../utils/userManager';

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

  const newUser = {
    id: Date.now().toString(),
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role || 'admin'
  };

  await createUser(newUser);

  return { 
    success: true, 
    data: { id: newUser.id, username: newUser.username, role: newUser.role } 
  };
});
