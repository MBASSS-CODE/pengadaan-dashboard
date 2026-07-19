import { executeMerge, checkMergePrerequisites, getMergeHistory } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const tahun = body?.tahun || new Date().getFullYear().toString();

  try {
    // Check prerequisites first
    const prereq = await checkMergePrerequisites(tahun);
    if (!prereq.allRequiredFound) {
      const missing = prereq.sources.filter((s: any) => s.required && !s.found).map((s: any) => s.label);
      return {
        success: false,
        message: `Data wajib belum tersedia: ${missing.join(', ')}. Sync data terlebih dahulu.`,
        prerequisites: prereq.sources
      };
    }

    const result = await executeMerge(tahun, 'manual');

    return {
      success: true,
      message: `Merge berhasil: ${result.result.total_records} records diproses dalam ${result.duration_ms}ms`,
      data: result
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
