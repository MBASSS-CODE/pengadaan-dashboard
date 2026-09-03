import { executeRealisasiMasterMerge } from '../utils/realisasiMasterMerge';

export default defineNitroPlugin(async (nitroApp) => {
  console.log('[Nitro] Application startup detected. Running initial Realisasi Master merge...');
  const currentYear = new Date().getFullYear().toString();
  
  try {
    // Run asynchronously to not block startup
    executeRealisasiMasterMerge(currentYear, 'startup')
      .then(res => {
        console.log(`[Nitro] Startup Realisasi Master merge completed. Status: ${res.status}`);
      })
      .catch(err => {
        console.error('[Nitro] Startup Realisasi Master merge failed:', err);
      });
  } catch (error) {
    console.error('[Nitro] Failed to initiate Realisasi Master merge:', error);
  }
});
