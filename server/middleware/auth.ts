import jwt from 'jsonwebtoken';

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  
  // Lindungi rute API khusus yang memerlukan otentikasi (misal: CRUD users)
  if (url.pathname.startsWith('/api/users')) {
    const token = getCookie(event, 'auth_token');
    
    if (!token) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Akses ditolak' });
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
