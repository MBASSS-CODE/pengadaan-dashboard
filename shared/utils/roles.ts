export const VALID_ROLES = ['developer', 'admin', 'ppk', 'user'] as const;
export type UserRole = (typeof VALID_ROLES)[number];

export const isValidRole = (role?: string | null): role is UserRole => {
  return Boolean(role && (VALID_ROLES as readonly string[]).includes(role));
};

export const isDeveloper = (role?: string | null): boolean => role === 'developer';

export const isPpk = (role?: string | null): boolean => role === 'ppk';

export const isAdminOrDeveloper = (role?: string | null): boolean =>
  role === 'developer' || role === 'admin';

export const hasAllowedRole = (
  role: string | null | undefined,
  allowedRoles?: readonly UserRole[]
): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!role) return false;
  return allowedRoles.includes(role as UserRole);
};

export const getDefaultHomePath = (role?: string | null): string => {
  return isPpk(role) ? '/ppk' : '/dashboard';
};

const normalizePath = (path: string): string => {
  const clean = path.split('?')[0]?.split('#')[0] || '/';
  return clean.replace(/\/+$/, '') || '/';
};

/**
 * Rute frontend yang termasuk grup DATA API (khusus role developer).
 * Catatan: '/dashboard' persis tetap dapat diakses semua user login,
 * sedangkan sub-rute '/dashboard/*' adalah halaman DATA API.
 */
export const isDataApiPath = (path: string): boolean => {
  const normalized = normalizePath(path);
  return (
    normalized.startsWith('/dashboard/') ||
    normalized === '/rup' ||
    normalized.startsWith('/rup/') ||
    normalized === '/tender' ||
    normalized.startsWith('/tender/') ||
    normalized === '/ekatalog' ||
    normalized.startsWith('/ekatalog/')
  );
};

export const isDeveloperOnlyAdminRoute = (path: string): boolean => {
  const normalized = normalizePath(path);
  return normalized === '/admin/system' || normalized.startsWith('/admin/system/');
};

export const isAdminRoute = (path: string): boolean => {
  const normalized = normalizePath(path);
  return (
    normalized === '/admin' ||
    normalized.startsWith('/admin/') ||
    normalized === '/users' ||
    normalized.startsWith('/users/')
  );
};

export const isPpkRoute = (path: string): boolean => {
  const normalized = normalizePath(path);
  return normalized === '/ppk' || normalized.startsWith('/ppk/');
};

export const isSummaryTableRoute = (path: string): boolean => {
  const normalized = normalizePath(path);
  return normalized === '/summary-table' || normalized.startsWith('/summary-table/');
};

/**
 * Whitelist API (default-deny) yang boleh diakses oleh akun PPK:
 * - /api/ppk/* (data pribadi milik PPK sendiri)
 * - /api/dashboard (ringkasan agregat makro instansi, tanpa daftar paket/PPK lain)
 * - /api/auth/change-password & /api/auth/logout
 */
export const isPpkAllowedApi = (pathname: string): boolean => {
  const normalized = normalizePath(pathname);
  return (
    normalized === '/api/ppk' ||
    normalized.startsWith('/api/ppk/') ||
    normalized === '/api/dashboard' ||
    normalized === '/api/auth/change-password' ||
    normalized === '/api/auth/logout'
  );
};

/**
 * Endpoint backend yang khusus hanya boleh diakses oleh role developer.
 */
export const isDeveloperOnlyApi = (pathname: string, method: string = 'GET'): boolean => {
  const normalized = normalizePath(pathname);

  if (normalized.startsWith('/api/data/')) {
    // master-satker dan merged/* dipakai oleh halaman Rekapitulasi & Metode Pengadaan (/summary-table/*)
    if (
      normalized === '/api/data/master-satker' ||
      normalized.startsWith('/api/data/merged/')
    ) {
      return false;
    }
    return true;
  }

  if (
    normalized === '/api/admin/system-stats' ||
    normalized === '/api/admin/cron-sync' ||
    normalized === '/api/admin/data-backup' ||
    normalized === '/api/admin/data-import' ||
    normalized === '/api/admin/endpoints-config'
  ) {
    return true;
  }

  // Mengubah jadwal cron di /admin/system hanya untuk developer;
  // GET /api/admin/cron tetap dipakai oleh /admin/penyedia-master.
  if (normalized === '/api/admin/cron' && method.toUpperCase() !== 'GET') {
    return true;
  }

  return false;
};

/**
 * Endpoint backend yang membutuhkan role minimal admin atau developer.
 */
export const isAdminApi = (pathname: string): boolean => {
  const normalized = normalizePath(pathname);
  return (
    normalized === '/api/users' ||
    normalized.startsWith('/api/users/') ||
    normalized === '/api/admin' ||
    normalized.startsWith('/api/admin/')
  );
};
