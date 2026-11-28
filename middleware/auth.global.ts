import {
  getDefaultHomePath,
  isAdminOrDeveloper,
  isAdminRoute,
  isDataApiPath,
  isDeveloper,
  isDeveloperOnlyAdminRoute,
  isPpk,
  isPpkRoute,
  isSummaryTableRoute
} from '~/shared/utils/roles';

export default defineNuxtRouteMiddleware((to, from) => {
  const isLoggedIn = useCookie('is_logged_in');
  const userRole = useCookie('user_role');
  const mustChangePassword = useCookie('must_change_password');

  const isPublicRoute = to.path === '/login' || to.path === '/' || to.path === '/public-dashboard';

  // Jika belum login dan mencoba membuka halaman terproteksi, arahkan ke login
  if (!isLoggedIn.value && !isPublicRoute) {
    return navigateTo('/login');
  }

  // Jika menggunakan password default / temporary password, wajib ke /change-password terlebih dahulu
  if (isLoggedIn.value && String(mustChangePassword.value) === 'true' && to.path !== '/change-password') {
    return navigateTo('/change-password');
  }

  // Jika sudah login dan mencoba ke halaman login, kembalikan ke beranda role masing-masing
  if (isLoggedIn.value && to.path === '/login') {
    return navigateTo(getDefaultHomePath(userRole.value));
  }

  // RBAC khusus role PPK: hanya boleh ke /ppk, /ppk/*, /dashboard (global agregat), /change-password, atau /
  if (isLoggedIn.value && isPpk(userRole.value)) {
    if (
      isSummaryTableRoute(to.path) ||
      isDataApiPath(to.path) ||
      isAdminRoute(to.path) ||
      to.path === '/public-dashboard'
    ) {
      return navigateTo('/ppk');
    }
    return;
  }

  // Non-PPK diarahkan keluar dari halaman Portal PPK
  if (isLoggedIn.value && isPpkRoute(to.path) && !isPpk(userRole.value)) {
    return navigateTo('/dashboard');
  }

  // RBAC: Menu DATA API dan /admin/system khusus untuk role developer
  if (isDataApiPath(to.path) && !isDeveloper(userRole.value)) {
    return navigateTo('/dashboard');
  }

  if (isDeveloperOnlyAdminRoute(to.path) && !isDeveloper(userRole.value)) {
    return navigateTo('/dashboard');
  }

  // RBAC: Halaman admin & manajemen pengguna hanya untuk developer dan admin
  if (isAdminRoute(to.path) && !isAdminOrDeveloper(userRole.value)) {
    return navigateTo('/dashboard');
  }
});
