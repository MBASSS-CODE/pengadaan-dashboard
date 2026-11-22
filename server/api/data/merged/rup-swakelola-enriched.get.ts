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

    // Filter by Satker
    const satker = query.satker as string;
    if (satker) {
      filteredData = filteredData.filter((item: any) => String(item.kd_satker) === satker);
    }

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

    const ts = filterArray(query.tipeSwakelola);
    if (ts.length > 0) {
      filteredData = filteredData.filter((item: any) => ts.includes(String(item.tipe_swakelola)));
    }

    const sd = filterArray(query.sumberDana);
    if (sd.length > 0) {
      filteredData = filteredData.filter((item: any) => {
        if (!item.sumber_dana_list) return false;
        return sd.some((s: string) => item.sumber_dana_list.includes(s));
      });
    }

    const sp = filterArray(query.statusPelaksanaan);
    if (sp.length > 0) {
      filteredData = filteredData.filter((item: any) => {
        if (sp.includes('Belum Tercatat') && !item._has_pelaksanaan) return true;
        if (sp.includes('Tercatat') && item._has_pelaksanaan) return true;
        if (item.pelaksanaan_status && sp.includes(item.pelaksanaan_status)) return true;
        return false;
      });
    }

    const um = query.statusUmumkan as string;
    if (um && um !== 'ALL') {
      filteredData = filteredData.filter((item: any) => item.status_umumkan_rup === um);
    }

    // Extract unique filter options
    const uniqueNamaPpk = [...new Set(data.map((item: any) => item.ppk_nama_lengkap || item.nama_ppk).filter(Boolean))].sort();
    const uniqueStatusUmumkan = [...new Set(data.map((item: any) => item.status_umumkan_rup).filter(Boolean))].sort();
    
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
        namaPpk: uniqueNamaPpk,
        statusUmumkan: uniqueStatusUmumkan
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal memuat data: ' + error.message
    };
  }
});
