import { saveCronConfig } from '../../utils/cronManager';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    if (!body || !body.schedule) {
      throw new Error('Jadwal (schedule) wajib diisi');
    }

    const config = await saveCronConfig({ schedule: body.schedule });
    
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
