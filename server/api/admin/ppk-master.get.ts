import { loadPpkMaster, extractUniquePpk, checkRupExists } from '../../utils/ppkManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();
  const tahunInt = parseInt(tahun, 10);
  const tahunSebelumnya = (tahunInt - 1).toString();

  try {
    const [ppkList, uniquePpkThisYear, uniquePpkLastYear, rupThisYearExists, rupLastYearExists] = await Promise.all([
      loadPpkMaster(),
      extractUniquePpk(tahun),
      extractUniquePpk(tahunSebelumnya),
      checkRupExists(tahun),
      checkRupExists(tahunSebelumnya)
    ]);

    const missingRupYears = [];
    if (!rupThisYearExists) missingRupYears.push(tahun);
    if (!rupLastYearExists) missingRupYears.push(tahunSebelumnya);

    const uniquePpkFromApi = [...new Set([...uniquePpkThisYear, ...uniquePpkLastYear])];

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
        totalIncomplete: mergedList.filter(p => !p.is_completed).length,
        missingRupYears
      },
      warning: missingRupYears.length > 0 
        ? `Referensi data RUP untuk tahun ${missingRupYears.join(' dan ')} belum diekstrak. Silakan ekstrak data RUP terlebih dahulu.` 
        : null
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
