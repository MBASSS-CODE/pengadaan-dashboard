import { checkMergePrerequisites, getMergeHistory } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const [prerequisites, history] = await Promise.all([
      checkMergePrerequisites(tahun),
      getMergeHistory()
    ]);

    // Get last merge for this tahun
    const lastMerge = history.find((h: any) => h.tahun === tahun);

    return {
      success: true,
      data: {
        prerequisites: prerequisites.sources,
        allRequiredFound: prerequisites.allRequiredFound,
        lastMerge,
        history: history.filter((h: any) => h.tahun === tahun).slice(0, 20)
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
