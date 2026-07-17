import { reloadCronJob, loadEndpointsConfig } from '../utils/cronManager';

export default defineNitroPlugin(async (nitroApp) => {
  console.log('[Startup] Memuat konfigurasi endpoint aktif...');
  await loadEndpointsConfig();
  console.log('[Startup] Mendaftarkan Cron Job Sinkronisasi Data via cronManager...');
  await reloadCronJob();
});
