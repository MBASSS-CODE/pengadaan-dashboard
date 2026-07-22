import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 50;

  try {
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'merged', `rup-penyedia-enriched_${tahun}.json`);
    const data = await readJsonSafe(filePath);

    if (!data) {
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

    // Filter Per Kolom (using comma-separated strings or arrays)
    const filterArray = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val.split(',').filter(Boolean);
    };

    const jp = filterArray(query.jenisPengadaan);
    if (jp.length > 0) {
      filteredData = filteredData.filter((item: any) => jp.includes(item.jenis_pengadaan));
    }

    const mp = filterArray(query.metodePengadaan);
    if (mp.length > 0) {
      filteredData = filteredData.filter((item: any) => mp.includes(item.metode_pengadaan));
    }

    const rs = filterArray(query.statusRealisasi);
    if (rs.length > 0) {
      filteredData = filteredData.filter((item: any) => rs.includes(item.realisasi_status));
    }

    const sd = filterArray(query.sumberDana);
    if (sd.length > 0) {
      filteredData = filteredData.filter((item: any) => {
        if (!item.sumber_dana_list) return false;
        // Check if ANY of the selected sumber_dana is included in the item's sumber_dana_list
        return sd.some((s: string) => item.sumber_dana_list.includes(s));
      });
    }

    const ppks = filterArray(query.ppk);
    if (ppks.length > 0) {
      filteredData = filteredData.filter((item: any) => ppks.includes(item.ppk_nama_lengkap) || ppks.includes(item.nama_ppk));
    }

    // Extract unique filter options
    const uniqueNamaPpk = [...new Set(data.map((item: any) => item.ppk_nama_lengkap || item.nama_ppk).filter(Boolean))].sort();
    const uniqueStatusUmumkan = [...new Set(data.map((item: any) => item.status_umumkan_rup).filter(Boolean))].sort();

    const um = query.statusUmumkan as string;
    if (um && um !== 'ALL') {
      filteredData = filteredData.filter((item: any) => item.status_umumkan_rup === um);
    }

    // Kalkulasi agregasi
    let totalPagu = 0;
    let realisasiCount = 0;
    let ppkCount = 0;

    for (const item of filteredData) {
      if (item.pagu) totalPagu += Number(item.pagu) || 0;
      if (item._has_realisasi) realisasiCount++;
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
