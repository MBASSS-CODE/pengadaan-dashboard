import { loadPpkMaster, extractUniquePpk } from '../../utils/ppkManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const [ppkList, uniquePpkFromApi] = await Promise.all([
      loadPpkMaster(),
      extractUniquePpk(tahun)
    ]);

    // Build merged view: all unique PPK from API + their completion status
    const mergedList = uniquePpkFromApi.map(masked => {
      const existing = ppkList.find((p: any) => p.nip_nama_masked === masked);
      return {
        nip_nama_masked: masked,
        nama_lengkap: existing?.nama_lengkap || '',
        nip_asli: existing?.nip_asli || '',
        jabatan: existing?.jabatan || '',
        unit_kerja: existing?.unit_kerja || '',
        telepon: existing?.telepon || '',
        email: existing?.email || '',
        is_completed: !!(existing?.nama_lengkap),
        created_at: existing?.created_at || null,
        updated_at: existing?.updated_at || null
      };
    });

    // Also include any PPK that was manually added but no longer in API data
    const extraPpk = ppkList.filter((p: any) => 
      !uniquePpkFromApi.includes(p.nip_nama_masked)
    ).map((p: any) => ({
      ...p,
      is_completed: !!(p.nama_lengkap),
      _orphaned: true // PPK ini tidak ditemukan di data non-tender terbaru
    }));

    return {
      success: true,
      data: [...mergedList, ...extraPpk],
      meta: {
        totalFromApi: uniquePpkFromApi.length,
        totalCompleted: mergedList.filter(p => p.is_completed).length,
        totalIncomplete: mergedList.filter(p => !p.is_completed).length
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
