import { saveCronConfig } from '../../utils/cronManager';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    if (typeof body.enablePenyedia !== 'boolean') {
      throw new Error('Nilai enablePenyedia tidak valid');
    }
    
    const config = await saveCronConfig({ enablePenyedia: body.enablePenyedia });
    
    return {
      success: true,
      message: body.enablePenyedia ? 'Cron antrean penyedia dinyalakan' : 'Cron antrean penyedia dimatikan',
      data: config
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
});
