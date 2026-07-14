import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByUsername } from '../../utils/userManager';

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

  const config = useRuntimeConfig();
  
  // Create JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role }, 
    config.jwtSecret || 'default_secret_key_change_me',
    { expiresIn: '1d' }
  );

  // Set HTTP Only Cookie untuk keamanan backend
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 1 day
  });

  // Set Public Cookie penanda untuk middleware Vue frontend (karena JWT HttpOnly tidak terbaca JS)
  setCookie(event, 'is_logged_in', 'true', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 
  });

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
});
