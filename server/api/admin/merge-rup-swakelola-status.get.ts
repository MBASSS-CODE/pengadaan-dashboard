import { getMergeHistory, checkRupSwakelolaPrerequisites } from '~/server/utils/mergeManager';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const tahun = (query.tahun as string) || new Date().getFullYear().toString();
    
    // 1. Check prerequisites
    const prereq = await checkRupSwakelolaPrerequisites(tahun);

    // 2. Get history & last merge
    const history = await getMergeHistory();
    const myHistory = history.filter(h => h.type === 'rup-swakelola' && h.tahun === tahun);

    return {
      success: true,
      data: {
        prerequisites: prereq.sources,
        allRequiredFound: prereq.allRequiredFound,
        lastMerge: myHistory.length > 0 ? myHistory[0] : null,
        history: myHistory
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal memuat status'
    };
  }
});
