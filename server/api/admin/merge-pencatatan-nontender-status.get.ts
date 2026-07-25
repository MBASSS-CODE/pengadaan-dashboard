import { checkMergePrerequisites, getMergeHistory } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const [prerequisites, history] = await Promise.all([
      checkMergePrerequisites(tahun),
      getMergeHistory()
    ]);

    // Filter only pencatatan-nontender history
    const pcnHistory = history.filter((h: any) => h.type === 'pencatatan-nontender' && h.tahun === tahun);
    const lastMerge = pcnHistory.length > 0 ? pcnHistory[0] : null;

    return {
      success: true,
      data: {
        prerequisites: prerequisites.sources,
        allRequiredFound: prerequisites.allRequiredFound,
        lastMerge,
        history: pcnHistory.slice(0, 20)
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
