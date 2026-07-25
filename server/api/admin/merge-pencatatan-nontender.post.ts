import { executePencatatanNonTenderMerge, checkMergePrerequisites } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const tahun = body?.tahun || new Date().getFullYear().toString();

    // Check prerequisites first
    const prereq = await checkMergePrerequisites(tahun);
    const hasData = prereq.sources.some((s: any) => s.found && s.endpoint === 'pencatatan-non-tender');
    const hasRealisasi = prereq.sources.some((s: any) => s.found && s.endpoint === 'pencatatan-non-tender-realisasi');

    if (!hasData) {
      return {
        success: false,
        message: 'Data utama Pencatatan Non-Tender belum tersedia. Sync data terlebih dahulu.',
        prerequisites: prereq.sources
      };
    }

    const result = await executePencatatanNonTenderMerge(tahun, 'manual');

    return {
      success: true,
      message: `Merge Pencatatan Non-Tender berhasil: ${result?.result.total_records || 0} records diproses`,
      data: result
    };
  } catch (error: any) {
    console.error('Error in POST /api/admin/merge-rup-penyedia', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: error.message || 'Internal Server Error'
    };
  }
});
