import { getRealisasiMasterData, getRealisasiOfficialSummary } from '../../utils/realisasiMasterMerge';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 50;

  try {
    const [unifiedData, officialSummary] = await Promise.all([
      getRealisasiMasterData(tahun),
      getRealisasiOfficialSummary(tahun)
    ]);

    if (!unifiedData || unifiedData.length === 0) {
      return {
        success: true,
        data: [],
        meta: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          totalNilai: 0,
          totalPagu: 0,
          totalPdn: 0,
          totalUmk: 0
        },
        filterOptions: {
          sumberTransaksi: [],
          metodePengadaan: []
        }
      };
    }

    let filteredData = [...unifiedData];
    let hasActiveFilter = false;

    if (query.search) {
      hasActiveFilter = true;
      const search = (query.search as string).toLowerCase();
      filteredData = filteredData.filter(item =>
        (item.nama_paket && item.nama_paket.toLowerCase().includes(search)) ||
        (item.kode_rup && String(item.kode_rup).toLowerCase().includes(search)) ||
        (item.kode_paket && String(item.kode_paket).toLowerCase().includes(search))
      );
    }

    if (query.sumberTransaksi) {
      hasActiveFilter = true;
      const sources = (query.sumberTransaksi as string).split(',');
      filteredData = filteredData.filter(item => sources.includes(item.sumber_transaksi));
    }

    if (query.metodePengadaan) {
      hasActiveFilter = true;
      const metode = (query.metodePengadaan as string).split(',');
      filteredData = filteredData.filter(item => metode.includes(item.metode_pengadaan));
    }

    filteredData.sort((a, b) => {
      const diff = (b._sort_date || 0) - (a._sort_date || 0);
      return diff !== 0 ? diff : (a._original_index || 0) - (b._original_index || 0);
    });

    const sumberSet = new Set<string>();
    const metodeSet = new Set<string>();

    let totalNilai = 0;
    let totalPagu = 0;
    let totalPdn = 0;
    let totalUmk = 0;

    for (const item of filteredData) {
      if (item.sumber_transaksi) sumberSet.add(item.sumber_transaksi);
      if (item.metode_pengadaan && item.metode_pengadaan !== '-') metodeSet.add(item.metode_pengadaan);

      totalNilai += Number(item.total_nilai) || 0;
      totalPagu += Number(item.nilai_pagu) || 0;
      totalPdn += Number(item.nilai_pdn) || 0;
      totalUmk += Number(item.nilai_umk) || 0;
    }

    const filterOptions = {
      sumberTransaksi: Array.from(sumberSet).sort(),
      metodePengadaan: Array.from(metodeSet).sort()
    };

    const totalItems = !hasActiveFilter && officialSummary?.jumlah_paket
      ? officialSummary.jumlah_paket
      : filteredData.length;
    const effectiveTotalNilai = !hasActiveFilter && officialSummary?.total_nilai
      ? officialSummary.total_nilai
      : totalNilai;
    const totalPages = Math.ceil(filteredData.length / limit) || 1;

    let paginatedData = filteredData;
    if (limit < 100000) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedData = filteredData.slice(startIndex, endIndex);
    }

    // Sanitasi field sensitif (PPK, Penyedia, kontak, dan properti internal) untuk endpoint publik
    const safeData = paginatedData.map(
      ({
        nama_ppk,
        ppk_nip_asli,
        ppk_nip_masked,
        ppk_jabatan,
        ppk_unit_kerja,
        ppk_telepon,
        ppk_email,
        _ppk_completed,
        nama_penyedia,
        penyedia_kode,
        penyedia_npwp,
        penyedia_alamat,
        penyedia_telepon,
        penyedia_email,
        penyedia_jenis_perusahaan,
        penyedia_bentuk_usaha,
        penyedia_status_umkk,
        penyedia_nib,
        _penyedia_completed,
        tx_pemenang_detail,
        tx_realisasi_list,
        _sort_date,
        _original_index,
        ...rest
      }) => ({
        ...rest,
        jenis_pengadaan: rest.jenis_pengadaan_enriched || rest.jenis_pengadaan || '-'
      })
    );

    return {
      success: true,
      data: safeData,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        totalNilai: effectiveTotalNilai,
        totalPagu,
        totalPdn,
        totalUmk
      },
      filterOptions
    };
  } catch (error: any) {
    console.error('API realisasi error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan'
    };
  }
});
