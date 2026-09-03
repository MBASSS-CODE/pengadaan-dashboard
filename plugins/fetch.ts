export default defineNuxtPlugin((nuxtApp) => {
  globalThis.$fetch = $fetch.create({

    onResponseError({ response }) {
      if (response.status === 401) {
        const isLoggedIn = useCookie('is_logged_in');
        isLoggedIn.value = null; // Hapus cookie secara global
        
        // Redirect ke halaman login jika di sisi klien dan bukan di halaman publik
        if (process.client) {
          const publicRoutes = ['/', '/login', '/public-dashboard'];
          const currentPath = window.location.pathname;
          
          if (!publicRoutes.includes(currentPath)) {
            window.location.href = '/login';
          }
        }
      }
    }
  });
});
