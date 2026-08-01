export default defineNuxtPlugin((nuxtApp) => {
  globalThis.$fetch = $fetch.create({

    onResponseError({ response }) {
      if (response.status === 401) {
        const isLoggedIn = useCookie('is_logged_in');
        isLoggedIn.value = null; // Hapus cookie secara global
        
        // Redirect ke halaman login jika di sisi klien
        if (process.client) {
          window.location.href = '/login';
        }
      }
    }
  });
});
