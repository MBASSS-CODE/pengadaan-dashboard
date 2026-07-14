export default defineNuxtRouteMiddleware((to, from) => {
  const isLoggedIn = useCookie('is_logged_in');
  const userRole = useCookie('user_role');

  // Jika tidak ada token (indikator login) dan bukan di halaman login, arahkan ke login
  if (!isLoggedIn.value && to.path !== '/login') {
    return navigateTo('/login');
  }

  // Jika sudah login dan mencoba ke halaman login, kembalikan ke beranda
  if (isLoggedIn.value && to.path === '/login') {
    return navigateTo('/');
  }

  // Role Management: hanya admin yang boleh akses /users
  if (to.path.startsWith('/users') && userRole.value !== 'admin') {
    return navigateTo('/');
  }
});
