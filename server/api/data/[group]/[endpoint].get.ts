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

    // Search: multi-field text search
    if (search) {
      filtered = filtered.filter((item: any) => {
        return (
          (item.nama_paket && item.nama_paket.toLowerCase().includes(search)) ||
          (item.nama_satker && item.nama_satker.toLowerCase().includes(search)) ||
          (item.nama_satker_penyelenggara && item.nama_satker_penyelenggara.toLowerCase().includes(search)) ||
          (item.nama_klpd_penyelenggara && item.nama_klpd_penyelenggara.toLowerCase().includes(search)) ||
          (item.nama_ppk && item.nama_ppk.toLowerCase().includes(search)) ||
          (item.kd_rup && item.kd_rup.toString().includes(search)) ||
          (item.nip_ppk && item.nip_ppk.toString().includes(search))
        );
      });
    }

    // ─── Extract unique filter options (from ALL data, before filtering) ─
    const uniqueStatusUmumkan = [...new Set(allData.map((item: any) => item.status_umumkan_rup).filter(Boolean))].sort();

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
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' });
  }
});
