import jwt from 'jsonwebtoken';
import { isAdminApi, isAdminOrDeveloper, isDeveloper, isDeveloperOnlyApi } from '../../shared/utils/roles';

interface AuthJwtPayload {
  id: string;
  username: string;
  role: string;
  mustChangePassword?: boolean;
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  
  const publicApiPaths = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/dashboard',
    '/api/summary-table/epurchasing-public',
    '/api/summary-table/epurchasing-analytics-summary-public',
    '/api/summary-table/realisasi-publik',
    '/api/summary-table/realisasi-analytics-publik'
  ];
  const isPublicApi = publicApiPaths.some(p => url.pathname.startsWith(p));

  // Lindungi semua rute API kecuali API login dan public
  if (url.pathname.startsWith('/api/') && !isPublicApi) {
    const token = getCookie(event, 'auth_token');
    
    if (!token) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Akses ditolak (Silakan login)' });
    }

    let decoded: AuthJwtPayload;
    try {
      const config = useRuntimeConfig();
      decoded = jwt.verify(token, config.jwtSecret || 'default_secret_key_change_me') as AuthJwtPayload;
      
      // Simpan data user ke context agar bisa dipakai di handler API
      event.context.user = decoded;
    } catch (error) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Token tidak valid atau kedaluwarsa' });
    }

    // Wajib ganti password default sebelum mengakses endpoint terproteksi lainnya
    if (decoded.mustChangePassword && url.pathname !== '/api/auth/change-password') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Anda wajib mengganti password default terlebih dahulu'
      });
    }

    // RBAC Backend
    if (isDeveloperOnlyApi(url.pathname, event.method) && !isDeveloper(decoded.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Akses khusus role developer'
      });
    }

    if (isAdminApi(url.pathname) && !isAdminOrDeveloper(decoded.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Akses khusus admin atau developer'
      });
    }
  }
});
