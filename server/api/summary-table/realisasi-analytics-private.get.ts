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

    // Load additional raw files
    const tenderDir = path.resolve(process.cwd(), 'server', 'data', 'tender');
    const tenderRaw = (await readJsonSafe(path.join(tenderDir, `pengumuman_${tahun}.json`))) || [];
    const pctSwakelolaRaw = (await readJsonSafe(path.join(tenderDir, `pencatatan-swakelola_${tahun}.json`))) || [];

    // Global mapping for PPK (NIP masked to Uncensored Name)
    const ppkNameMap = new Map<string, string>();
    const extractPpkName = (item: any) => {
      const nip = item.rup_nip_ppk || item.nip_ppk;
      const uncensored = item.ppk_nama_lengkap;
      if (nip && uncensored && !uncensored.includes('*') && uncensored !== 'Tidak Diketahui') {
        ppkNameMap.set(nip, uncensored);
      }
    };
    [...epurchasing, ...nontender, ...pctNontender, ...tender].forEach(extractPpkName);

    const getPpkName = (item: any, fallback: string) => {
      const nip = item.rup_nip_ppk || item.nip_ppk;
      if (nip && ppkNameMap.has(nip)) {
        return ppkNameMap.get(nip);
      }
      return fallback;
    };

    // Maps for aggregations
    const maps = {
      trend: {} as Record<string, { count: number; total: number }>,
      sumberTransaksi: {} as Record<string, { count: number; total: number }>,
      metodePengadaan: {} as Record<string, { count: number; total: number }>,
      jenisPengadaan: {} as Record<string, { count: number; total: number }>,
      sumberDana: {} as Record<string, { count: number; total: number }>,
      ppk: {} as Record<string, { count: number; total: number }>,
      penyedia: {} as Record<string, { count: number; total: number }>
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
      isUmk: boolean,
      ppk: string,
      penyedia: string
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

      // 6. PPK
      if (ppk && ppk !== 'Tidak Diketahui' && ppk !== '-') {
        let ppkEntry = maps.ppk[ppk];
        if (!ppkEntry) {
          ppkEntry = { count: 0, total: 0 };
          maps.ppk[ppk] = ppkEntry;
        }
        ppkEntry.count++;
        ppkEntry.total += nilai;
      }

      // 7. Penyedia
      if (penyedia && penyedia !== 'Tidak Diketahui' && penyedia !== '-') {
        let pyEntry = maps.penyedia[penyedia];
        if (!pyEntry) {
          pyEntry = { count: 0, total: 0 };
          maps.penyedia[penyedia] = pyEntry;
        }
        pyEntry.count++;
        pyEntry.total += nilai;
      }
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
        isUmk,
        getPpkName(item, item.ppk_nama_lengkap || item.nama_ppk || '-'),
        item.penyedia_nama || '-'
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
        isUmk,
        getPpkName(item, item.nama_ppk || item.ppk_nama_lengkap || '-'),
        item.nama_penyedia || item.pemenang || '-'
      );
    }

    // Process Pencatatan Nontender
    for (const item of pctNontender) {
      const nilai = Number(item.total_realisasi) || Number(item.pagu) || 0;
      const isPdn = (item.nilai_pdn_pct > 0 || item.rup_status_pdn === 'PDN' || item.rup_status_pdn === 'Ya');
      const isUmk = (item.nilai_umk_pct > 0 || item.rup_status_ukm === 'UKM' || item.rup_status_ukm === 'Ya');
      const realisasi = item.realisasi_list?.[0] || {};
      const penyedia = realisasi.nama_penyedia || '-';

      processItem(
        item.tgl_buat_paket,
        'Pencatatan Non Tender',
        item.mtd_pemilihan || 'Tidak Diketahui',
        item.kategori_pengadaan || item.rup_jenis_pengadaan || 'Tidak Diketahui',
        item.sumber_dana || 'Tidak Diketahui',
        nilai,
        isPdn,
        isUmk,
        getPpkName(item, item.nama_ppk || '-'),
        penyedia
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
        isUmk,
        getPpkName(item, item.nama_ppk || item.ppk_nama_lengkap || '-'),
        item.nama_pemenang || '-'
      );
    }

    // Process Tender Raw
    if (tender.length === 0 && tenderRaw.length > 0) {
      for (const item of tenderRaw) {
        const nilai = Number(item.pagu) || Number(item.hps) || 0;
        const isPdn = false;
        const isUmk = false;

        processItem(
          item.tgl_buat_paket,
          'Tender',
          item.mtd_pemilihan || 'Tender',
          item.jenis_pengadaan || 'Tidak Diketahui',
          item.sumber_dana || 'Tidak Diketahui',
          nilai,
          isPdn,
          isUmk,
          getPpkName(item, item.nama_ppk || '-'),
          '-'
        );
      }
    }

    // Process Pencatatan Swakelola Raw
    for (const item of pctSwakelolaRaw) {
      const nilai = Number(item.total_realisasi) || Number(item.pagu) || 0;
      const isPdn = (item.nilai_pdn_pct > 0);
      const isUmk = (item.nilai_umk_pct > 0);

      processItem(
        item.tgl_buat_paket,
        'Pencatatan Swakelola',
        'Swakelola',
        'Swakelola',
        item.sumber_dana || 'Tidak Diketahui',
        nilai,
        isPdn,
        isUmk,
        getPpkName(item, item.nama_ppk || '-'),
        item.tipe_swakelola_nama || 'Swakelola'
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
        sumberDana: formatToArray(maps.sumberDana, 'total'),
        topPpk: formatToArray(maps.ppk, 'total').slice(0, 10),
        topPenyedia: formatToArray(maps.penyedia, 'total').slice(0, 10)
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
