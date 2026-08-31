import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 50;

  try {
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'merged', `epurchasing_enriched_${tahun}.json`);
    const data = await readJsonSafe(filePath);

    if (!data) {
      return {
        success: false,
        message: 'Data belum di-merge atau tidak tersedia.'
      };
    }

    // Paksa filter hanya untuk COMPLETED dan ON_PROCESS
    const allowedStatus = ['COMPLETED', 'ON_PROCESS'];
    let filteredData = data.filter((item: any) => allowedStatus.includes(item.status));

    // Hapus field sensitif
    filteredData = filteredData.map((item: any) => {
      const {
        penyedia_nama,
        penyedia_npwp,
        kode_penyedia,
        rup_nama_ppk,
        rup_nip_ppk,
        ppk_nama_lengkap,
        ppk_nip_asli,
        ppk_jabatan,
        ppk_telepon,
        ppk_email,
        ...safeData
      } = item;
      return safeData;
    });

    // Filter Global Search (hanya pada data yang tidak sensitif)
    const search = query.search as string;
    if (search) {
      const s = search.toLowerCase();
      filteredData = filteredData.filter((item: any) => 
        (item.order_id && item.order_id.toLowerCase().includes(s)) ||
        (String(item.rup_code).includes(s))
      );
    }

    // Filter Per Kolom
    const filterArray = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val.split(',').filter(Boolean);
    };

    const shipSt = filterArray(query.shipmentStatus);
    if (shipSt.length > 0) {
      filteredData = filteredData.filter((item: any) => shipSt.includes(item.shipment_status));
    }

    const umkk = filterArray(query.statusUmkk);
    if (umkk.length > 0) {
      filteredData = filteredData.filter((item: any) => umkk.includes(item.penyedia_status_umkk));
    }

    // Extract unique filter options
    const uniqueStatus = allowedStatus;
    const uniqueShipmentStatus = [...new Set(filteredData.map((item: any) => item.shipment_status).filter(Boolean))].sort();
    const uniqueUmkk = [...new Set(filteredData.map((item: any) => item.penyedia_status_umkk).filter(Boolean))].sort();

    // Kalkulasi agregasi
    let totalBelanja = 0;
    let qtyCount = 0;
    let rupMatched = 0;
    let umkmCount = 0;

    for (const item of filteredData) {
      if (item.total) totalBelanja += Number(item.total) || 0;
      if (item.total_qty) qtyCount += Number(item.total_qty) || 0;
      if (item._rup_matched) rupMatched++;
      if (item.penyedia_status_umkk && item.penyedia_status_umkk !== 'Non-UMKM' && item.penyedia_status_umkk !== 'Tidak Diketahui') umkmCount++;
    }

    // Sort descending by order_date
    filteredData.sort((a: any, b: any) => {
      const dateA = a.order_date ? new Date(a.order_date).getTime() : 0;
      const dateB = b.order_date ? new Date(b.order_date).getTime() : 0;
      return dateB - dateA;
    });

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
        totalBelanja,
        qtyCount,
        rupMatched,
        umkmCount
      },
      filterOptions: {
        status: uniqueStatus,
        shipmentStatus: uniqueShipmentStatus,
        statusUmkk: uniqueUmkk
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal memuat data: ' + error.message
    };
  }
});
