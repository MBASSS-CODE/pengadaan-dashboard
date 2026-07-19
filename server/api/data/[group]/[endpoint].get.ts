import { getEndpointData } from '../../../utils/dataManager';

export default defineEventHandler(async (event) => {
  const group = getRouterParam(event, 'group');
  const endpoint = getRouterParam(event, 'endpoint');
  
  const query = getQuery(event);
  const tahun = query.tahun as string;
  
  if (!group || !endpoint) {
    throw createError({ statusCode: 400, statusMessage: 'Group or Endpoint missing' });
  }
  
  if (!tahun) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter tahun is required' });
  }

  // Pagination parameters
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));

  // Search & filter parameters
  const search = (query.search as string || '').toLowerCase().trim();
  const filterAktif = query.filterAktif as string;
  const filterDelete = query.filterDelete as string;
  const filterUmumkan = query.filterUmumkan as string;
  const filterDate = query.filterDate as string;
  const filterJenisRevisi = query.filterJenisRevisi as string;
  
  const filterStatusNontender = query.filterStatusNontender as string;
  const filterMtdPemilihan = query.filterMtdPemilihan as string;
  const filterSatker = query.filterSatker as string;

  // Pisahkan extra parameters yang bukan pagination/filter (untuk diteruskan ke API eksternal)
  const forceRefresh = query.forceRefresh === 'true';
  const extraParams = { ...query };
  delete extraParams.tahun;
  delete extraParams.forceRefresh;
  delete extraParams.page;
  delete extraParams.limit;
  delete extraParams.search;
  delete extraParams.filterAktif;
  delete extraParams.filterDelete;
  delete extraParams.filterUmumkan;
  delete extraParams.filterDate;
  delete extraParams.filterJenisRevisi;
  delete extraParams.filterStatusNontender;
  delete extraParams.filterMtdPemilihan;
  delete extraParams.filterSatker;

  try {
    const allData: any[] = await getEndpointData(group, endpoint, tahun, extraParams, forceRefresh);

    // ─── Server-side filtering ───────────────────────────────────────────
    let filtered = allData;

    // Filter: status_aktif_rup
    if (filterAktif && filterAktif !== 'ALL') {
      const boolAktif = filterAktif === 'true';
      filtered = filtered.filter((item: any) => item.status_aktif_rup === boolAktif);
    }

    // Filter: status_delete_rup
    if (filterDelete && filterDelete !== 'ALL') {
      const boolDelete = filterDelete === 'true';
      filtered = filtered.filter((item: any) => item.status_delete_rup === boolDelete);
    }

    // Filter: status_umumkan_rup
    if (filterUmumkan && filterUmumkan !== 'ALL') {
      filtered = filtered.filter((item: any) => item.status_umumkan_rup === filterUmumkan);
    }

    // Filter: filterDate (khusus kaji ulang)
    if (filterDate) {
      filtered = filtered.filter((item: any) => {
        if (!item.tgl_kaji_ulang) return false;
        return item.tgl_kaji_ulang.startsWith(filterDate);
      });
    }

    // Filter: filterJenisRevisi (khusus kaji ulang)
    if (filterJenisRevisi) {
      filtered = filtered.filter((item: any) => {
        if (!item.jenis_revisi) return false;
        return item.jenis_revisi.toUpperCase() === filterJenisRevisi.toUpperCase();
      });
    }

    // Filter: status_nontender
    if (filterStatusNontender && filterStatusNontender !== 'ALL') {
      filtered = filtered.filter((item: any) => item.status_nontender === filterStatusNontender);
    }

    // Filter: mtd_pemilihan
    if (filterMtdPemilihan && filterMtdPemilihan !== 'ALL') {
      filtered = filtered.filter((item: any) => item.mtd_pemilihan === filterMtdPemilihan);
    }

    // Filter: nama_satker
    if (filterSatker && filterSatker !== 'ALL') {
      filtered = filtered.filter((item: any) => item.nama_satker === filterSatker);
    }

    // Search: dynamic multi-field text search (works for any endpoint)
    if (search) {
      filtered = filtered.filter((item: any) => {
        // Cek semua key di dalam object item
        return Object.values(item).some(val => {
          if (val && (typeof val === 'string' || typeof val === 'number')) {
            return val.toString().toLowerCase().includes(search);
          }
          return false;
        });
      });
    }

    // ─── Extract unique filter options (from ALL data, before filtering) ─
    const uniqueStatusUmumkan = [...new Set(allData.map((item: any) => item.status_umumkan_rup).filter(Boolean))].sort();
    const uniqueStatusNontender = [...new Set(allData.map((item: any) => item.status_nontender).filter(Boolean))].sort();
    const uniqueMtdPemilihan = [...new Set(allData.map((item: any) => item.mtd_pemilihan).filter(Boolean))].sort();
    const uniqueSatker = [...new Set(allData.map((item: any) => item.nama_satker).filter(Boolean))].sort();

    // ─── Pagination ──────────────────────────────────────────────────────
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginatedData,
      meta: {
        page,
        limit,
        totalItems: totalFiltered,
        totalPages,
        totalAllItems: allData.length,
      },
      filterOptions: {
        statusUmumkan: uniqueStatusUmumkan,
        statusNontender: uniqueStatusNontender,
        mtdPemilihan: uniqueMtdPemilihan,
        satker: uniqueSatker
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' });
  }
});
