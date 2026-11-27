import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';

export interface SessionUserPayload {
  id: string;
  username: string;
  role: string;
  mustChangePassword?: boolean;
}

const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day

/**
 * Menerbitkan token JWT HttpOnly dan cookie penanda sesi frontend.
 */
export const issueAuthSessionCookies = (
  event: H3Event,
  user: { id: string; username: string; role: string },
  mustChangePassword: boolean
) => {
  const config = useRuntimeConfig();
  const isProd = process.env.NODE_ENV === 'production';

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      mustChangePassword
    },
    config.jwtSecret || 'default_secret_key_change_me',
    { expiresIn: '1d' }
  );

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE
  });

  setCookie(event, 'is_logged_in', 'true', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE
  });

  setCookie(event, 'user_role', user.role, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE
  });

  setCookie(event, 'user_name', user.username, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE
  });

  if (mustChangePassword) {
    setCookie(event, 'must_change_password', 'true', {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE
    });
  } else {
    deleteCookie(event, 'must_change_password');
  }
};

export const clearAuthSessionCookies = (event: H3Event) => {
  deleteCookie(event, 'auth_token');
  deleteCookie(event, 'is_logged_in');
  deleteCookie(event, 'user_role');
  deleteCookie(event, 'user_name');
  deleteCookie(event, 'must_change_password');
};
