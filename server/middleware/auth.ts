import jwt from 'jsonwebtoken';

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  
  // Lindungi semua rute API kecuali API login
  if (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth/login')) {
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
