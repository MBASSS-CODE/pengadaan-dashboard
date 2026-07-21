import { executeRupPenyediaMerge } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const tahun = body?.tahun || new Date().getFullYear().toString();

    // Trigger merge manually
    const result = await executeRupPenyediaMerge(tahun, 'manual');

    if (result.status === 'success') {
      return {
        success: true,
        message: `Berhasil menggabungkan ${result.result.total_records} data RUP Penyedia`,
        data: result
      };
    } else {
      setResponseStatus(event, 500);
      return {
        success: false,
        message: `Gagal: ${result.error || 'Terjadi kesalahan saat proses merge'}`
      };
    }
  } catch (error: any) {
    console.error('Error in POST /api/admin/merge-rup-penyedia', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: error.message || 'Internal Server Error'
    };
  }
});
