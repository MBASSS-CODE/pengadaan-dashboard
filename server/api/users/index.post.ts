import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { findUserByUsername, createUser } from '../../utils/userManager';
import { isAdminOrDeveloper, isDeveloper, isValidRole } from '../../../shared/utils/roles';

export default defineEventHandler(async (event) => {
  const actorRole = event.context.user?.role as string | undefined;
  if (!isAdminOrDeveloper(actorRole)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Anda tidak memiliki akses' });
  }

  const body = await readBody(event);
  const { username, password, role } = body || {};

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username dan password wajib diisi' });
  }

  const targetRole = (role || 'user') as string;
  if (!isValidRole(targetRole)) {
    throw createError({ statusCode: 400, statusMessage: 'Role tidak valid' });
  }

  if (isDeveloper(targetRole) && !isDeveloper(actorRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Hanya developer yang dapat membuat user dengan role developer'
    });
  }

  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    throw createError({ statusCode: 400, statusMessage: 'Username sudah digunakan' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    role: targetRole,
    must_change_password: 0
  };

  await createUser(newUser);

  return {
    success: true,
    data: { id: newUser.id, username: newUser.username, role: newUser.role }
  };
});
