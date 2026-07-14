export default defineNuxtRouteMiddleware((to, from) => {
  const isLoggedIn = useCookie('is_logged_in');

  // Jika tidak ada token (indikator login) dan bukan di halaman login, arahkan ke login
  if (!isLoggedIn.value && to.path !== '/login') {
    return navigateTo('/login');
  }

  // Jika sudah login dan mencoba ke halaman login, kembalikan ke beranda
  if (isLoggedIn.value && to.path === '/login') {
    return navigateTo('/');
  }
});
