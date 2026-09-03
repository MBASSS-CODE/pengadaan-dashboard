import { executeRealisasiMasterMerge } from '../../utils/realisasiMasterMerge';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const tahun = body?.tahun || new Date().getFullYear().toString();

  try {
    const result = await executeRealisasiMasterMerge(tahun, 'manual');
    return {
      success: true,
      message: `Berhasil menggabungkan ${result.result.total_records} data Realisasi Master.`,
      data: result
    };
  } catch (error: any) {
    console.error('Realisasi Master Merge error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat menggabungkan data Realisasi Master',
      error: error.message
    };
  }
});
