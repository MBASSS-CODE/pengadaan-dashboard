import { saveCronConfig } from '../../utils/cronManager';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    if (!body) {
      throw new Error('Data wajib diisi');
    }

    const newConfig: any = {};
    if (body.schedule !== undefined) newConfig.schedule = body.schedule;
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
