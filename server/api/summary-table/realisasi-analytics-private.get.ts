import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const dir = path.resolve(process.cwd(), 'server', 'data', 'merged');
    
    // Load all possible files
    const epurchasing = (await readJsonSafe(path.join(dir, `epurchasing_enriched_${tahun}.json`))) || [];
    const nontender = (await readJsonSafe(path.join(dir, `nontender_enriched_${tahun}.json`))) || [];
    const pctNontender = (await readJsonSafe(path.join(dir, `pencatatan-nontender-enriched_${tahun}.json`))) || [];
    const tender = (await readJsonSafe(path.join(dir, `tender_enriched_${tahun}.json`))) || [];

    // Maps for aggregations
    const maps = {
      trend: {} as Record<string, { count: number; total: number }>,
      sumberTransaksi: {} as Record<string, { count: number; total: number }>,
      metodePengadaan: {} as Record<string, { count: number; total: number }>,
      jenisPengadaan: {} as Record<string, { count: number; total: number }>,
      sumberDana: {} as Record<string, { count: number; total: number }>
    };

    let totalNilai = 0;
    let totalPesanan = 0;
    let totalPdn = 0;
    let totalUmk = 0;

    const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const processItem = (
      dateStr: string,
      sumberTrans: string,
      metode: string,
      jenis: string,
      sumberDana: string,
      nilai: number,
      isPdn: boolean,
      isUmk: boolean
    ) => {
      totalPesanan++;
      totalNilai += nilai;
      if (isPdn) totalPdn += nilai;
      if (isUmk) totalUmk += nilai;

      // 1. Trend per Bulan
      let orderMonth = 'Tidak Diketahui';
      if (dateStr) {
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj.getTime())) {
          orderMonth = bulanNames[dateObj.getMonth()] || 'Tidak Diketahui';
        }
      }
      let trendEntry = maps.trend[orderMonth];
      if (!trendEntry) {
        trendEntry = { count: 0, total: 0 };
        maps.trend[orderMonth] = trendEntry;
      }
      trendEntry.count++;
      trendEntry.total += nilai;

      // 2. Sumber Transaksi
      let stEntry = maps.sumberTransaksi[sumberTrans];
      if (!stEntry) {
        stEntry = { count: 0, total: 0 };
        maps.sumberTransaksi[sumberTrans] = stEntry;
      }
      stEntry.count++;
      stEntry.total += nilai;

      // 3. Metode Pengadaan
      let metodeEntry = maps.metodePengadaan[metode];
      if (!metodeEntry) {
        metodeEntry = { count: 0, total: 0 };
        maps.metodePengadaan[metode] = metodeEntry;
      }
      metodeEntry.count++;
      metodeEntry.total += nilai;

      // 4. Jenis Pengadaan
      let jenisEntry = maps.jenisPengadaan[jenis];
      if (!jenisEntry) {
        jenisEntry = { count: 0, total: 0 };
        maps.jenisPengadaan[jenis] = jenisEntry;
      }
      jenisEntry.count++;
      jenisEntry.total += nilai;

      // 5. Sumber Dana
      let sdEntry = maps.sumberDana[sumberDana];
      if (!sdEntry) {
        sdEntry = { count: 0, total: 0 };
        maps.sumberDana[sumberDana] = sdEntry;
      }
      sdEntry.count++;
      sdEntry.total += nilai;
    };

    // Process Epurchasing
    for (const item of epurchasing) {
      if (!['COMPLETED', 'ON_PROCESS'].includes(item.status)) continue;
      const nilai = Number(item.total) || 0;
      const isPdn = (item.flag_minikom === true || String(item.flag_minikom).toLowerCase() === 'true' || String(item.flag_minikom).toLowerCase() === 'ya');
      const isUmk = (item.penyedia_status_umkk && item.penyedia_status_umkk !== 'Non-UMKM' && item.penyedia_status_umkk !== 'Tidak Diketahui');
      
      processItem(
        item.order_date,
        'E-Katalog',
        item.rup_metode_pengadaan || 'E-Purchasing',
        item.rup_jenis_pengadaan || 'Tidak Diketahui',
        item.funding_source || 'Tidak Diketahui',
        nilai,
        isPdn,
        isUmk
      );
    }

    // Process Nontender
    for (const item of nontender) {
      const nilai = Number(item.pagu) || Number(item.anggaran_total) || 0;
      const isPdn = (item.rup_status_pdn === 'PDN' || item.rup_status_pdn === 'Ya');
      const isUmk = (item.rup_status_ukm === 'UKM' || item.rup_status_ukm === 'Ya');

      processItem(
        item.tgl_buat_paket,
        'Non Tender',
        item.mtd_pemilihan || 'Tidak Diketahui',
        item.jenis_pengadaan || item.rup_jenis_pengadaan || 'Tidak Diketahui',
        item.sumber_dana || item.anggaran_sumber_dana || 'Tidak Diketahui',
        nilai,
        isPdn,
        isUmk
      );
    }

    // Process Pencatatan Nontender
    for (const item of pctNontender) {
      const nilai = Number(item.total_realisasi) || Number(item.pagu) || 0;
      const isPdn = (item.nilai_pdn_pct > 0 || item.rup_status_pdn === 'PDN' || item.rup_status_pdn === 'Ya');
      const isUmk = (item.nilai_umk_pct > 0 || item.rup_status_ukm === 'UKM' || item.rup_status_ukm === 'Ya');

      processItem(
        item.tgl_buat_paket,
        'Pencatatan Non Tender',
        item.mtd_pemilihan || 'Tidak Diketahui',
        item.kategori_pengadaan || item.rup_jenis_pengadaan || 'Tidak Diketahui',
        item.sumber_dana || 'Tidak Diketahui',
        nilai,
        isPdn,
        isUmk
      );
    }

    // Process Tender
    for (const item of tender) {
      const nilai = Number(item.harga_kontrak) || Number(item.pagu) || 0;
      const isPdn = (item.rup_status_pdn === 'PDN' || item.rup_status_pdn === 'Ya');
      const isUmk = (item.rup_status_ukm === 'UKM' || item.rup_status_ukm === 'Ya');

      processItem(
        item.tgl_buat_paket,
        'Tender',
        item.mtd_pemilihan || 'Tidak Diketahui',
        item.jenis_pengadaan || item.rup_jenis_pengadaan || 'Tidak Diketahui',
        item.sumber_dana || 'Tidak Diketahui',
        nilai,
        isPdn,
        isUmk
      );
    }

    // Format Maps into Sorted Arrays
    const formatToArray = (mapObj: Record<string, {count: number, total: number}>, sortBy: 'total'|'count'|'none' = 'none') => {
      let arr = Object.entries(mapObj).map(([label, val]) => ({
        label,
        count: val.count,
        total: val.total,
        persentase: totalNilai > 0 ? ((val.total / totalNilai) * 100).toFixed(2) + '%' : '0%'
      }));

      if (sortBy === 'total') {
        arr.sort((a, b) => b.total - a.total);
      } else if (sortBy === 'count') {
        arr.sort((a, b) => b.count - a.count);
      }
      return arr;
    };

    // Special sorting for trend to keep month order
    const trendArray = bulanNames.map(bulan => {
      const val = maps.trend[bulan] || { count: 0, total: 0 };
      return {
        label: bulan,
        count: val.count,
        total: val.total,
        persentase: totalNilai > 0 ? ((val.total / totalNilai) * 100).toFixed(2) + '%' : '0%'
      };
    }).filter(i => i.count > 0 || totalPesanan === 0);

    return {
      success: true,
      message: 'Berhasil memuat analytics summary',
      summary: {
        totalPesanan,
        totalNilai,
        totalPdn,
        totalUmk,
        trend: trendArray,
        sumberTransaksi: formatToArray(maps.sumberTransaksi, 'total'),
        metodePengadaan: formatToArray(maps.metodePengadaan, 'total'),
        jenisPengadaan: formatToArray(maps.jenisPengadaan, 'total'),
        sumberDana: formatToArray(maps.sumberDana, 'total')
      }
    };

  } catch (error: any) {
    console.error('[Realisasi Analytics API] Error:', error.message);
    return {
      success: false,
      message: 'Terjadi kesalahan sistem saat memuat analytics summary.',
      summary: null
    };
  }
});
