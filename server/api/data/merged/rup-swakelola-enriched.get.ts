import { getEndpointData } from '../../../utils/dataManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 50;

  try {
    const data = await getEndpointData('merged', 'rup-swakelola-enriched', tahun);

    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'Data belum di-merge atau tidak tersedia.'
      };
    }

    let filteredData = data;

    // Filter Global Search
    const search = query.search as string;
    if (search) {
      const s = search.toLowerCase();
      filteredData = filteredData.filter((item: any) => 
        (item.nama_paket && item.nama_paket.toLowerCase().includes(s)) ||
        (String(item.kd_rup).includes(s)) ||
        (item.nama_satker && item.nama_satker.toLowerCase().includes(s)) ||
        (item.ppk_nama_lengkap && item.ppk_nama_lengkap.toLowerCase().includes(s))
      );
    }

    // Filter Per Kolom
    const filterArray = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val.split(',').filter(Boolean);
    };

    const ppks = filterArray(query.ppk);
    if (ppks.length > 0) {
      filteredData = filteredData.filter((item: any) => ppks.includes(item.ppk_nama_lengkap) || ppks.includes(item.nama_ppk));
    }

    // Extract unique filter options
    const uniqueNamaPpk = [...new Set(data.map((item: any) => item.ppk_nama_lengkap || item.nama_ppk).filter(Boolean))].sort();
    
    // Kalkulasi agregasi
    let totalPagu = 0;
    let realisasiCount = 0;
    let ppkCount = 0;

    for (const item of filteredData) {
      if (item.pagu) totalPagu += Number(item.pagu) || 0;
      if (item._has_pelaksanaan) realisasiCount++;
      if (item._ppk_completed) ppkCount++;
    }

    // Sort newest first or by RUP descending
    filteredData.sort((a: any, b: any) => b.kd_rup - a.kd_rup);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginated = filteredData.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginated,
      meta: {
        totalItems: filteredData.length,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(filteredData.length / limit),
        totalPagu,
        realisasiCount,
        ppkCount
      },
      filterOptions: {
        namaPpk: uniqueNamaPpk
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal memuat data: ' + error.message
    };
  }
});
