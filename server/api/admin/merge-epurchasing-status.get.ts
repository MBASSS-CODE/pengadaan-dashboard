import { getMergeHistory } from '~/server/utils/mergeManager';
import { checkEPurchasingPrerequisites } from '~/server/utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const [prerequisites, history] = await Promise.all([
      checkEPurchasingPrerequisites(tahun),
      getMergeHistory()
    ]);

    // Filter only epurchasing history
    const epurchasingHistory = history.filter((h: any) => h.type === 'epurchasing' && h.tahun === tahun);
    const lastMerge = epurchasingHistory.length > 0 ? epurchasingHistory[0] : null;

    return {
      success: true,
      data: {
        prerequisites: prerequisites.sources,
        allRequiredFound: prerequisites.allRequiredFound,
        lastMerge,
        history: epurchasingHistory.slice(0, 20)
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat memeriksa status merge E-Purchasing'
    };
  }
});
