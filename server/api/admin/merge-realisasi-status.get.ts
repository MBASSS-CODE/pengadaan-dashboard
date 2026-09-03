import { getRealisasiMasterMergeStatus } from '../../utils/realisasiMasterMerge';
import { checkMergePrerequisites } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const statusData = await getRealisasiMasterMergeStatus(tahun);
    const prereq = await checkMergePrerequisites(tahun);

    return {
      success: true,
      data: {
        ...statusData,
        prerequisites: prereq.sources,
        allRequiredFound: prereq.allRequiredFound
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal mengambil status merge Realisasi Master',
      error: error.message
    };
  }
});
