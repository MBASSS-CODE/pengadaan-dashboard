import bcrypt from 'bcryptjs';
import { findUserByUsername, getDefaultDevCredentials } from '../../utils/userManager';
import { issueAuthSessionCookies } from '../../utils/authSession';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username dan password wajib diisi' });
  }

  const user = await findUserByUsername(username);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Username atau password salah' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: 'Username atau password salah' });
  }

  const devCreds = getDefaultDevCredentials();
  const mustChangePassword =
    user.role === 'developer' &&
    (Boolean(user.must_change_password) || bcrypt.compareSync(devCreds.password, user.passwordHash));

  issueAuthSessionCookies(event, user, mustChangePassword);

  return {
    success: true,
    mustChangePassword,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
});
