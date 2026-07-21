import { checkRupPenyediaPrerequisites, getMergeHistory } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const [prerequisites, history] = await Promise.all([
      checkRupPenyediaPrerequisites(tahun),
      getMergeHistory()
    ]);

    // Get last merge for this tahun specifically for rup-penyedia
    const rupPenyediaHistory = history.filter((h: any) => h.tahun === tahun && h.type === 'rup-penyedia');
    const lastMerge = rupPenyediaHistory.length > 0 ? rupPenyediaHistory[0] : null;

    return {
      success: true,
      data: {
        prerequisites: prerequisites.sources,
        allRequiredFound: prerequisites.allRequiredFound,
        lastMerge,
        history: rupPenyediaHistory.slice(0, 20)
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
