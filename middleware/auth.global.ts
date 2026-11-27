import {
  isAdminOrDeveloper,
  isAdminRoute,
  isDataApiPath,
  isDeveloper,
  isDeveloperOnlyAdminRoute
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

  // Jika menggunakan password default, wajib ke /change-password terlebih dahulu
  if (isLoggedIn.value && String(mustChangePassword.value) === 'true' && to.path !== '/change-password') {
    return navigateTo('/change-password');
  }

  // Jika sudah login dan mencoba ke halaman login, kembalikan ke dashboard
  if (isLoggedIn.value && to.path === '/login') {
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
