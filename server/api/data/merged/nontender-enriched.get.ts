import { getMergedData } from '../../../utils/mergeManager';

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
  const filterMetode = query.filterMetode as string;
  const filterRupMatch = query.filterRupMatch as string;
  const filterPpkComplete = query.filterPpkComplete as string;
  const filterNamaPpk = query.filterNamaPpk as string;
  const filterStatusNontender = query.filterStatusNontender as string;
  const filterSatker = query.filterSatker as string;

  try {
    const allData = await getMergedData(tahun);

    // If no data exists, we return empty early so frontend can show empty state
    if (!allData || allData.length === 0) {
       return {
        success: true,
        data: [],
        meta: { page, limit, totalItems: 0, totalPages: 0, totalAllItems: 0 },
        filterOptions: { metodePemilihan: [], namaPpk: [] }
      };
    }

    // ─── Server-side filtering ───────────────────────────────────────────
    let filtered = allData;

    if (filterMetode && filterMetode !== 'ALL') {
      filtered = filtered.filter((item: any) => item.mtd_pemilihan === filterMetode);
    }
    
    if (filterRupMatch && filterRupMatch !== 'ALL') {
      const boolVal = filterRupMatch === 'true';
      filtered = filtered.filter((item: any) => item._rup_matched === boolVal);
    }
    
    if (filterPpkComplete && filterPpkComplete !== 'ALL') {
      const boolVal = filterPpkComplete === 'true';
      filtered = filtered.filter((item: any) => item._ppk_completed === boolVal);
    }
    
    if (filterNamaPpk && filterNamaPpk !== 'ALL') {
      filtered = filtered.filter((item: any) => item.ppk_nama_lengkap === filterNamaPpk);
    }

    if (filterStatusNontender && filterStatusNontender !== 'ALL') {
      filtered = filtered.filter((item: any) => item.status_nontender === filterStatusNontender);
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
    const uniqueMetode = [...new Set(allData.map((item: any) => item.mtd_pemilihan).filter(Boolean))].sort();
    const uniqueNamaPpk = [...new Set(allData.map((item: any) => item.ppk_nama_lengkap).filter(Boolean))].sort();
    const uniqueStatusNontender = [...new Set(allData.map((item: any) => item.status_nontender).filter(Boolean))].sort();
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
        metodePemilihan: uniqueMetode,
        namaPpk: uniqueNamaPpk,
        statusNontender: uniqueStatusNontender,
        satker: uniqueSatker
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' });
  }
});
