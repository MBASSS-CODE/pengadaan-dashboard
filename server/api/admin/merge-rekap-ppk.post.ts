import { executeRekapPpkMerge } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const tahun = String(body?.tahun || '2026');

  try {
    const result = await executeRekapPpkMerge(tahun, 'manual');
    return {
      success: result.status !== 'failed',
      message:
        result.status === 'failed'
          ? `Merge Rekap PPK gagal: ${result.error}`
          : `Merge Rekap PPK selesai (${result.records_output} PPK diproses)`,
      data: result
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal menjalankan merge rekap PPK',
      data: null
    };
  }
});
