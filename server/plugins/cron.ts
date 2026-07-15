import cron from 'node-cron';
import { syncEndpointData } from '../utils/dataManager';

// Daftar endpoint aktif per grup yang akan disinkronisasi secara otomatis
export const activeEndpoints: Record<string, string[]> = {
  rup: [
    'history-kaji-ulang',
    'master-satker',
    'paket-anggaran-penyedia',
  ],
  ekatalog: [
    // contoh: 'list_produk'
  ],
  // Tambahkan grup dan endpoint lainnya di sini sesuai kebutuhan
};

export default defineNitroPlugin((nitroApp) => {
  console.log('Mendaftarkan Cron Job Sinkronisasi Data...');

  // Jadwal: Setiap jam 06:00 dan 12:00
  cron.schedule('0 6,12 * * *', async () => {
    console.log('[Cron Job] Memulai sinkronisasi data otomatis...');
    
    // Secara default, gunakan tahun berjalan untuk sinkronisasi rutin
    const currentYear = new Date().getFullYear().toString();

    for (const [group, endpoints] of Object.entries(activeEndpoints)) {
      if (!endpoints) continue;
      for (const endpoint of endpoints) {
        try {
          console.log(`[Cron Job] Menjalankan sinkronisasi untuk ${group}/${endpoint} tahun ${currentYear}...`);
          // Memanggil syncEndpointData dari server/utils (Otomatis di-import oleh Nitro)
          await syncEndpointData(group, endpoint, currentYear);
        } catch (error) {
          console.error(`[Cron Job] Gagal melakukan sinkronisasi ${group}/${endpoint}:`, error);
        }
      }
    }

    console.log('[Cron Job] Sinkronisasi data otomatis selesai.');
  });
});
