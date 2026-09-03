import { reloadCronJob, loadEndpointsConfig, triggerSyncAll } from '../utils/cronManager';
import { checkMergePrerequisites } from '../utils/mergeManager';

export default defineNitroPlugin(async (nitroApp) => {
  console.log('[Startup] Memuat konfigurasi endpoint aktif...');
  await loadEndpointsConfig();
  console.log('[Startup] Mendaftarkan Cron Job Sinkronisasi Data via cronManager...');
  await reloadCronJob();

  // Auto-sync on startup if data is empty (e.g. after fresh deploy/build wipe)
  try {
    const currentYear = new Date().getFullYear().toString();
    const prerequisites = await checkMergePrerequisites(currentYear);
    
    if (!prerequisites.allRequiredFound) {
      console.log(`[Startup] Data wajib untuk tahun ${currentYear} hilang atau belum lengkap. Memulai sinkronisasi otomatis di latar belakang...`);
      // triggerSyncAll runs asynchronously using setTimeout inside cronManager, won't block startup
      await triggerSyncAll();
    } else {
      console.log(`[Startup] Data untuk tahun ${currentYear} sudah tersedia. Sinkronisasi awal dilewati.`);
    }
  } catch (error) {
    console.error('[Startup] Terjadi kesalahan saat memeriksa data awal:', error);
  }
});
