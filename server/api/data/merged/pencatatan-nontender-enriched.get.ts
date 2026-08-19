import { getEndpointData } from '../../../utils/dataManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();
  
  if (!tahun) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter tahun is required' });
  }

  // Pagination parameters
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));

  // Search & filter parameters
  const search = (query.search as string || '').toLowerCase().trim();
  const filterMtdPemilihan = query.filterMtdPemilihan as string;
  const filterStatusNontender = query.filterStatusNontender as string;
  const filterSatker = query.filterSatker as string;

  try {
    // getEndpointData reads from server/data/merged/pencatatan-nontender-enriched_{tahun}.json
    const allData = await getEndpointData('merged', 'pencatatan-nontender-enriched', tahun, {}, false);

    if (!allData || allData.length === 0) {
       return {
        success: true,
        data: [],
        meta: { page, limit, totalItems: 0, totalPages: 0, totalAllItems: 0 },
        filterOptions: { mtdPemilihan: [], statusNontender: [], satker: [] }
      };
    }

    // ─── Server-side filtering ───────────────────────────────────────────
    let filtered = allData;

    if (filterMtdPemilihan && filterMtdPemilihan !== 'ALL') {
      filtered = filtered.filter((item: any) => item.mtd_pemilihan === filterMtdPemilihan || item.rup_metode_pengadaan === filterMtdPemilihan);
    }
    
    if (filterStatusNontender && filterStatusNontender !== 'ALL') {
      filtered = filtered.filter((item: any) => item.status_nontender_pct === filterStatusNontender);
    }
    
    if (filterSatker && filterSatker !== 'ALL') {
      filtered = filtered.filter((item: any) => item.nama_satker === filterSatker);
    }

    // Search: dynamic multi-field text search
    if (search) {
      filtered = filtered.filter((item: any) => {
        return Object.values(item).some(val => {
          if (val && (typeof val === 'string' || typeof val === 'number')) {
            return val.toString().toLowerCase().includes(search);
          }
          return false;
        });
      });
    }

    // ─── Extract unique filter options ─
    const uniqueMetode = [...new Set(allData.map((item: any) => item.mtd_pemilihan || item.rup_metode_pengadaan).filter(Boolean))].sort();
    const uniqueStatusNontender = [...new Set(allData.map((item: any) => item.status_nontender_pct).filter(Boolean))].sort();
    const uniqueSatker = [...new Set(allData.map((item: any) => item.nama_satker).filter(Boolean))].sort();

    // ─── Pagination ──────────────────────────────────────────────────────
    const totalFiltered = filtered.length;
    
    // Calculate totals for the filtered data
    const totalPagu = filtered.reduce((sum: number, item: any) => sum + (Number(item.pagu) || 0), 0);
    const totalRealisasi = filtered.reduce((sum: number, item: any) => sum + (Number(item.total_realisasi) || 0), 0);

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
        totalPagu,
        totalRealisasi,
        totalPages,
        totalAllItems: allData.length,
      },
      filterOptions: {
        mtdPemilihan: uniqueMetode,
        statusNontender: uniqueStatusNontender,
        satker: uniqueSatker
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' });
  }
});
