export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    // Mengecek secara periodik apakah cookie sesi masih ada
    setInterval(() => {
      const isLoggedIn = useCookie('is_logged_in');
      const currentPath = window.location.pathname;
      const publicRoutes = ['/', '/login', '/public-dashboard'];

      // Jika cookie tidak ada (kehabisan session) dan user sedang berada di halaman yang butuh login
      if (!isLoggedIn.value && !publicRoutes.includes(currentPath)) {
        window.location.href = '/login';
      }
    }, 5000); // Cek setiap 5 detik
  }
});
