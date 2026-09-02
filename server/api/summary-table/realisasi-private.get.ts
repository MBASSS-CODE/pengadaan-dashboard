import { getRealisasiData } from '../../utils/realisasiMergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 50;
  const forceRefresh = query.refresh === 'true';

  try {
    let unifiedData = await getRealisasiData(tahun, forceRefresh);

    // Filter Global Search
    const search = query.search as string;
    if (search) {
      const s = search.toLowerCase();
      unifiedData = unifiedData.filter((item: any) => 
        (String(item.kode_paket).toLowerCase().includes(s)) ||
        (String(item.kode_rup).includes(s)) ||
        (String(item.nama_paket).toLowerCase().includes(s)) ||
        (String(item.nama_penyedia).toLowerCase().includes(s)) ||
        (String(item.nama_ppk).toLowerCase().includes(s))
      );
    }

    // Filter by Sumber Transaksi
    const filterSumber = query.sumberTransaksi as string;
    if (filterSumber) {
      const arr = filterSumber.split(',').filter(Boolean);
      unifiedData = unifiedData.filter((item: any) => arr.includes(item.sumber_transaksi));
    }

    // Filter by Metode Pengadaan
    const filterMetode = query.metodePengadaan as string;
    if (filterMetode) {
      const arr = filterMetode.split(',').filter(Boolean);
      unifiedData = unifiedData.filter((item: any) => arr.includes(item.metode_pengadaan));
    }

    // Extract unique filter options
    const uniqueSumber = [...new Set(unifiedData.map((item: any) => item.sumber_transaksi).filter(Boolean))].sort();
    const uniqueMetode = [...new Set(unifiedData.map((item: any) => item.metode_pengadaan).filter(Boolean))].sort();

    // Kalkulasi agregasi
    let totalNilai = 0;
    let totalPdn = 0;
    let totalUmk = 0;

    for (const item of unifiedData) {
      totalNilai += item.total_nilai;
      totalPdn += item.nilai_pdn;
      totalUmk += item.nilai_umk;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginated = unifiedData.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginated,
      meta: {
        totalItems: unifiedData.length,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(unifiedData.length / limit),
        totalNilai,
        totalPdn,
        totalUmk
      },
      filterOptions: {
        sumberTransaksi: uniqueSumber,
        metodePengadaan: uniqueMetode
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal memuat data: ' + error.message
    };
  }
});
