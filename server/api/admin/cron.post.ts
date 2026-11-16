import cron from 'node-cron';
import { saveCronConfig } from '../../utils/cronManager';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    if (!body) {
      throw new Error('Data wajib diisi');
    }

    const newConfig: any = {};
    if (body.schedule !== undefined) {
      const trimmedSchedule = String(body.schedule).trim();
      if (!cron.validate(trimmedSchedule)) {
        throw new Error(`Format cron '${trimmedSchedule}' tidak valid. Gunakan format standar 5 kolom (contoh: 0 6,12 * * *).`);
      }
      newConfig.schedule = trimmedSchedule;
    }
    if (body.enableMainCron !== undefined) newConfig.enableMainCron = body.enableMainCron;

    if (Object.keys(newConfig).length === 0) {
      throw new Error('Tidak ada data konfigurasi yang diubah');
    }

    const config = await saveCronConfig(newConfig);
    
    return {
      success: true,
      message: 'Jadwal Cron berhasil diperbarui',
      data: config
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
});
