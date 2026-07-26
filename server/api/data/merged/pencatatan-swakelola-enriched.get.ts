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
  const filterTipeSwakelola = query.filterTipeSwakelola as string;
  const filterStatusSwakelola = query.filterStatusSwakelola as string;
  const filterSatker = query.filterSatker as string;

  try {
    // getEndpointData reads from server/data/merged/pencatatan-swakelola-enriched_{tahun}.json
    const allData = await getEndpointData('merged', 'pencatatan-swakelola-enriched', tahun, {}, false);

    if (!allData || allData.length === 0) {
       return {
        success: true,
        data: [],
        meta: { page, limit, totalItems: 0, totalPages: 0, totalAllItems: 0 },
        filterOptions: { tipeSwakelola: [], statusSwakelola: [], satker: [] }
      };
    }

    // ─── Server-side filtering ───────────────────────────────────────────
    let filtered = allData;

    if (filterTipeSwakelola && filterTipeSwakelola !== 'ALL') {
      filtered = filtered.filter((item: any) => String(item.tipe_swakelola) === String(filterTipeSwakelola));
    }
    
    if (filterStatusSwakelola && filterStatusSwakelola !== 'ALL') {
      filtered = filtered.filter((item: any) => item.status_swakelola_pct === filterStatusSwakelola);
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
    const uniqueTipe = [...new Set(allData.map((item: any) => item.tipe_swakelola).filter(Boolean))].sort();
    const uniqueStatusSwakelola = [...new Set(allData.map((item: any) => item.status_swakelola_pct).filter(Boolean))].sort();
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
        tipeSwakelola: uniqueTipe,
        statusSwakelola: uniqueStatusSwakelola,
        satker: uniqueSatker
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' });
  }
});
