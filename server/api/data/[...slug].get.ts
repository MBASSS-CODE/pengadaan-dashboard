import { getEndpointData } from '../../utils/dataManager';

export default defineEventHandler(async (event) => {
  const rawSlug = getRouterParam(event, 'slug') || (event.context.params as any)?.slug || (event.context.params as any)?._ || '';
  const slug = Array.isArray(rawSlug) ? rawSlug.join('/') : String(rawSlug);
  const parts = slug.split('/').filter(Boolean);
  
  if (parts.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Group or Endpoint missing in path' });
  }

  const group = parts[0];
  const endpoint = parts.slice(1).join('/');
  
  const query = getQuery(event);
  const tahun = query.tahun as string;
  
  if (!tahun) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter tahun is required' });
  }

  // Pagination parameters
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100000, Math.max(1, parseInt(query.limit as string) || 10));

  // Search & filter parameters
  const search = (query.search as string || '').toLowerCase().trim();
  const filterAktif = query.filterAktif as string;
  const filterDelete = query.filterDelete as string;
  const filterUmumkan = query.filterUmumkan as string;
  const filterDate = query.filterDate as string;
  const filterJenisRevisi = query.filterJenisRevisi as string;
  
  const filterStatusNontender = query.filterStatusNontender as string;
  const filterStatusTender = query.filterStatusTender as string;
  const filterMtdPemilihan = query.filterMtdPemilihan as string;
  const filterSatker = (query.filterSatker || query.kd_satker) as string;
  const filterPemenang = query.filterPemenang as string;
  
  const filterStatus = query.filterStatus as string;
  const filterShipmentStatus = query.filterShipmentStatus as string;
  const filterFundingSource = query.filterFundingSource as string;

  // Pisahkan extra parameters yang bukan pagination/filter lokal (untuk diteruskan ke API eksternal)
  const forceRefresh = query.forceRefresh === 'true';
  const extraParams: Record<string, any> = { ...query };
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
  delete extraParams.filterStatusTender;
  delete extraParams.filterMtdPemilihan;
  delete extraParams.filterSatker;
  delete extraParams.kd_satker;
  delete extraParams.filterPemenang;
  delete extraParams.filterStatus;
  delete extraParams.filterShipmentStatus;
  delete extraParams.filterFundingSource;

  try {
    const allData: any[] = await getEndpointData(group, endpoint, tahun, extraParams, forceRefresh);

    // ─── Server-side filtering ───────────────────────────────────────────
    let filtered: any[] = [];
    if (Array.isArray(allData)) {
      filtered = allData;
    } else if (allData && typeof allData === 'object' && Object.keys(allData).length > 0) {
      filtered = [allData];
    }

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

    // Filter: status_tender
    if (filterStatusTender && filterStatusTender !== 'ALL') {
      filtered = filtered.filter((item: any) => item.status_tender === filterStatusTender);
    }

    // Filter: mtd_pemilihan
    if (filterMtdPemilihan && filterMtdPemilihan !== 'ALL') {
      filtered = filtered.filter((item: any) => item.mtd_pemilihan === filterMtdPemilihan);
    }

    // Filter: nama_satker, nama_satuan_kerja, atau kd_satker
    if (filterSatker && filterSatker !== 'ALL') {
      filtered = filtered.filter((item: any) => 
        item.nama_satker === filterSatker ||
        item.nama_satuan_kerja === filterSatker ||
        String(item.kd_satker) === filterSatker ||
        String(item.kd_satker_str) === filterSatker
      );
    }

    // Filter: pemenang (khusus peserta tender)
    if (filterPemenang && filterPemenang !== 'ALL') {
      const isWinner = filterPemenang === '1' || filterPemenang === 'true';
      filtered = filtered.filter((item: any) => Boolean(item.pemenang) === isWinner);
    }

    // Filter: status (general / e-purchasing)
    if (filterStatus && filterStatus !== 'ALL') {
      filtered = filtered.filter((item: any) => item.status === filterStatus);
    }

    // Filter: shipment_status (e-purchasing)
    if (filterShipmentStatus && filterShipmentStatus !== 'ALL') {
      filtered = filtered.filter((item: any) => item.shipment_status === filterShipmentStatus);
    }

    // Filter: funding_source (e-purchasing)
    if (filterFundingSource && filterFundingSource !== 'ALL') {
      filtered = filtered.filter((item: any) => item.funding_source === filterFundingSource);
    }

    // Search: dynamic multi-field text search (works for any endpoint)
    if (search) {
      filtered = filtered.filter((item: any) => {
        return Object.values(item).some(val => {
          if (val !== null && val !== undefined && (typeof val === 'string' || typeof val === 'number')) {
            return val.toString().toLowerCase().includes(search);
          }
          return false;
        });
      });
    }

    // ─── Extract unique filter options (from ALL data, before filtering) ─
    const uniqueStatusUmumkan = [...new Set(filtered.map((item: any) => item.status_umumkan_rup).filter(Boolean))].sort();
    const uniqueStatusNontender = [...new Set(filtered.map((item: any) => item.status_nontender).filter(Boolean))].sort();
    const uniqueStatusTender = [...new Set(filtered.map((item: any) => item.status_tender).filter(Boolean))].sort();
    const uniqueMtdPemilihan = [...new Set(filtered.map((item: any) => item.mtd_pemilihan).filter(Boolean))].sort();
    const uniqueSatker = [...new Set(filtered.map((item: any) => item.nama_satker || item.nama_satuan_kerja).filter(Boolean))].sort();
    const uniqueStatus = [...new Set(filtered.map((item: any) => item.status).filter(Boolean))].sort();
    const uniqueShipmentStatus = [...new Set(filtered.map((item: any) => item.shipment_status).filter(Boolean))].sort();
    const uniqueFundingSource = [...new Set(filtered.map((item: any) => item.funding_source).filter(Boolean))].sort();

    // ─── Pagination ──────────────────────────────────────────────────────
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
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
        totalAllItems: Array.isArray(allData) ? allData.length : (allData ? 1 : 0),
      },
      filterOptions: {
        statusUmumkan: uniqueStatusUmumkan,
        statusNontender: uniqueStatusNontender,
        statusTender: uniqueStatusTender,
        mtdPemilihan: uniqueMtdPemilihan,
        satker: uniqueSatker,
        status: uniqueStatus,
        shipmentStatus: uniqueShipmentStatus,
        fundingSource: uniqueFundingSource
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' });
  }
});
