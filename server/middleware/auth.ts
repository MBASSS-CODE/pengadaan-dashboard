import jwt from 'jsonwebtoken';

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  
  const publicApiPaths = [
    '/api/auth/login',
    '/api/dashboard',
    '/api/summary-table/epurchasing-public',
    '/api/summary-table/epurchasing-analytics-summary-public'
  ];
  const isPublicApi = publicApiPaths.some(p => url.pathname.startsWith(p));

  // Lindungi semua rute API kecuali API login dan public
  if (url.pathname.startsWith('/api/') && !isPublicApi) {
    const token = getCookie(event, 'auth_token');
    
    if (!token) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Akses ditolak (Silakan login)' });
    }

    try {
      const config = useRuntimeConfig();
      const decoded = jwt.verify(token, config.jwtSecret || 'default_secret_key_change_me');
      
      // Simpan data user ke context agar bisa dipakai di handler API
      event.context.user = decoded;
    } catch (error) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Token tidak valid atau kedaluwarsa' });
    }
  }
});
