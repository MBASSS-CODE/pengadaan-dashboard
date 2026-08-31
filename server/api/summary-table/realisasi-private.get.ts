import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 50;

  try {
    const dir = path.resolve(process.cwd(), 'server', 'data', 'merged');
    
    // Load all possible files
    const epurchasing = (await readJsonSafe(path.join(dir, `epurchasing_enriched_${tahun}.json`))) || [];
    const nontender = (await readJsonSafe(path.join(dir, `nontender_enriched_${tahun}.json`))) || [];
    const pctNontender = (await readJsonSafe(path.join(dir, `pencatatan-nontender-enriched_${tahun}.json`))) || [];
    const tender = (await readJsonSafe(path.join(dir, `tender_enriched_${tahun}.json`))) || [];

    let unifiedData: any[] = [];

    // Map Epurchasing
    for (const item of epurchasing) {
      if (!['COMPLETED', 'ON_PROCESS'].includes(item.status)) continue;

      unifiedData.push({
        nama_satker: item.nama_satker,
        kode_paket: item.order_id,
        kode_rup: item.rup_code,
        tahun_anggaran: item.fiscal_year,
        sumber_transaksi: 'E-Katalog',
        sumber_dana: item.funding_source || '-',
        nama_penyedia: item.penyedia_nama || '-',
        nama_ppk: item.ppk_nama_lengkap || item.rup_nama_ppk || '-',
        metode_pengadaan: item.rup_metode_pengadaan || 'E-Purchasing',
        jenis_pengadaan: item.rup_jenis_pengadaan || '-',
        nama_paket: item.rup_nama_paket || item.rup_name || item.rup_desc || '-',
        status_paket: item.status,
        tahapan_pengadaan: item.status === 'COMPLETED' ? 'Selesai' : 'Kontrak',
        total_nilai: Number(item.total) || 0,
        nilai_pdn: (item.flag_minikom === true || String(item.flag_minikom).toLowerCase() === 'true' || String(item.flag_minikom).toLowerCase() === 'ya') ? (Number(item.total) || 0) : 0,
        nilai_umk: (item.penyedia_status_umkk && item.penyedia_status_umkk !== 'Non-UMKM' && item.penyedia_status_umkk !== 'Tidak Diketahui') ? (Number(item.total) || 0) : 0,
        _sort_date: item.order_date ? new Date(item.order_date).getTime() : 0
      });
    }

    // Map Nontender
    for (const item of nontender) {
      unifiedData.push({
        nama_satker: item.nama_satker,
        kode_paket: item.kd_nontender,
        kode_rup: item.kd_rup,
        tahun_anggaran: item.tahun_anggaran,
        sumber_transaksi: 'Non Tender',
        sumber_dana: item.sumber_dana || item.anggaran_sumber_dana || '-',
        nama_penyedia: item.nama_penyedia || item.pemenang || '-',
        nama_ppk: item.ppk_nama_lengkap || '-',
        metode_pengadaan: item.mtd_pemilihan || '-',
        jenis_pengadaan: item.jenis_pengadaan || item.rup_jenis_pengadaan || '-',
        nama_paket: item.nama_paket || '-',
        status_paket: item.status_nontender || '-',
        tahapan_pengadaan: item.status_nontender || '-',
        total_nilai: Number(item.pagu) || Number(item.anggaran_total) || 0,
        nilai_pdn: (item.rup_status_pdn === 'PDN' || item.rup_status_pdn === 'Ya') ? (Number(item.pagu) || 0) : 0,
        nilai_umk: (item.rup_status_ukm === 'UKM' || item.rup_status_ukm === 'Ya') ? (Number(item.pagu) || 0) : 0,
        _sort_date: item.tgl_buat_paket ? new Date(item.tgl_buat_paket).getTime() : 0
      });
    }

    // Map Pencatatan Nontender
    for (const item of pctNontender) {
      const realisasi = item.realisasi_list?.[0] || {};
      const penyedia = realisasi.nama_penyedia || '-';

      unifiedData.push({
        nama_satker: item.nama_satker,
        kode_paket: item.kd_nontender_pct,
        kode_rup: item.kd_rup,
        tahun_anggaran: item.tahun_anggaran,
        sumber_transaksi: 'Pencatatan Non Tender',
        sumber_dana: item.sumber_dana || '-',
        nama_penyedia: penyedia,
        nama_ppk: item.ppk_nama_lengkap || item.nama_ppk || '-',
        metode_pengadaan: item.mtd_pemilihan || '-',
        jenis_pengadaan: item.kategori_pengadaan || item.rup_jenis_pengadaan || '-',
        nama_paket: item.nama_paket || '-',
        status_paket: item.status_nontender_pct_ket || item.status_nontender_pct || '-',
        tahapan_pengadaan: item.status_nontender_pct_ket || '-',
        total_nilai: Number(item.total_realisasi) || Number(item.pagu) || 0,
        nilai_pdn: (item.nilai_pdn_pct > 0 || item.rup_status_pdn === 'PDN' || item.rup_status_pdn === 'Ya') ? (Number(item.total_realisasi) || Number(item.pagu) || 0) : 0,
        nilai_umk: (item.nilai_umk_pct > 0 || item.rup_status_ukm === 'UKM' || item.rup_status_ukm === 'Ya') ? (Number(item.total_realisasi) || Number(item.pagu) || 0) : 0,
        _sort_date: item.tgl_buat_paket ? new Date(item.tgl_buat_paket).getTime() : 0
      });
    }

    // Map Tender
    for (const item of tender) {
      unifiedData.push({
        nama_satker: item.nama_satker,
        kode_paket: item.kd_tender,
        kode_rup: item.kd_rup,
        tahun_anggaran: item.tahun_anggaran,
        sumber_transaksi: 'Tender',
        sumber_dana: item.sumber_dana || '-',
        nama_penyedia: item.nama_pemenang || '-',
        nama_ppk: item.nama_ppk || item.ppk_nama_lengkap || '-',
        metode_pengadaan: item.mtd_pemilihan || '-',
        jenis_pengadaan: item.jenis_pengadaan || item.rup_jenis_pengadaan || '-',
        nama_paket: item.nama_paket || '-',
        status_paket: item.status_tender || '-',
        tahapan_pengadaan: item.tahapan_tender || '-',
        total_nilai: Number(item.harga_kontrak) || Number(item.pagu) || 0,
        nilai_pdn: (item.rup_status_pdn === 'PDN' || item.rup_status_pdn === 'Ya') ? (Number(item.harga_kontrak) || Number(item.pagu) || 0) : 0,
        nilai_umk: (item.rup_status_ukm === 'UKM' || item.rup_status_ukm === 'Ya') ? (Number(item.harga_kontrak) || Number(item.pagu) || 0) : 0,
        _sort_date: item.tgl_buat_paket ? new Date(item.tgl_buat_paket).getTime() : 0
      });
    }

    // Filter Global Search
    const search = query.search as string;
    if (search) {
      const s = search.toLowerCase();
      unifiedData = unifiedData.filter((item: any) => 
        (String(item.kode_paket).toLowerCase().includes(s)) ||
        (String(item.kode_rup).includes(s)) ||
        (String(item.nama_paket).toLowerCase().includes(s)) ||
        (String(item.nama_penyedia).toLowerCase().includes(s)) ||
        (String(item.nama_ppk).toLowerCase().includes(s))
      );
    }

    // Filter by Sumber Transaksi
    const filterSumber = query.sumberTransaksi as string;
    if (filterSumber) {
      const arr = filterSumber.split(',').filter(Boolean);
      unifiedData = unifiedData.filter((item: any) => arr.includes(item.sumber_transaksi));
    }

    // Filter by Metode Pengadaan
    const filterMetode = query.metodePengadaan as string;
    if (filterMetode) {
      const arr = filterMetode.split(',').filter(Boolean);
      unifiedData = unifiedData.filter((item: any) => arr.includes(item.metode_pengadaan));
    }

    // Extract unique filter options
    const uniqueSumber = [...new Set(unifiedData.map((item: any) => item.sumber_transaksi).filter(Boolean))].sort();
    const uniqueMetode = [...new Set(unifiedData.map((item: any) => item.metode_pengadaan).filter(Boolean))].sort();

    // Kalkulasi agregasi
    let totalNilai = 0;
    let totalPdn = 0;
    let totalUmk = 0;

    for (const item of unifiedData) {
      totalNilai += item.total_nilai;
      totalPdn += item.nilai_pdn;
      totalUmk += item.nilai_umk;
    }

    // Sort descending by date
    unifiedData.sort((a: any, b: any) => b._sort_date - a._sort_date);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginated = unifiedData.slice(startIndex, endIndex);

    // Remove _sort_date from final output
    const cleanPaginated = paginated.map(({ _sort_date, ...rest }) => rest);

    return {
      success: true,
      data: cleanPaginated,
      meta: {
        totalItems: unifiedData.length,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(unifiedData.length / limit),
        totalNilai,
        totalPdn,
        totalUmk
      },
      filterOptions: {
        sumberTransaksi: uniqueSumber,
        metodePengadaan: uniqueMetode
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal memuat data: ' + error.message
    };
  }
});
