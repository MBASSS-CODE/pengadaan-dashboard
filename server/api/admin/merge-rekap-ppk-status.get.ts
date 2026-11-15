import { checkRekapPpkPrerequisites, getMergeHistory } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = String(query.tahun || '2026');

  try {
    const { sources, allRequiredFound } = await checkRekapPpkPrerequisites(tahun);
    const history = await getMergeHistory();
    const ppkHistory = history.filter((h: any) => h.tahun === tahun && h.type === 'rekap-ppk');

    return {
      success: true,
      data: {
        prerequisites: sources,
        allRequiredFound,
        lastMerge: ppkHistory[0] || null,
        history: ppkHistory.slice(0, 10)
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal mengambil status merge rekap PPK'
    };
  }
});
