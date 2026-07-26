import { executePencatatanSwakelolaMerge } from '~/server/utils/mergeManager';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const tahun = body.tahun || new Date().getFullYear().toString();
    
    // Non-blocking trigger by sending response immediately and running merge in background?
    // Based on existing merge APIs, we await it so we can return the result status.
    const result = await executePencatatanSwakelolaMerge(tahun, 'manual_admin');
    
    if (result && result.status === 'success' && 'result' in result) {
      return {
        success: true,
        message: `Berhasil melakukan integrasi data pencatatan swakelola (${result.result.total_records} records)`,
        data: result
      };
    } else {
      return {
        success: false,
        message: result && 'error' in result ? result.error : 'Gagal mengeksekusi merge',
        data: result
      };
    }
    
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan sistem',
    };
  }
});
