import { getRealisasiData } from '../../utils/realisasiMergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const data = await getRealisasiData(tahun, true);

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

    for (const item of data) {
      const nilai = item.total_nilai || 0;
      const dateStr = item._sort_date;
      const isPdn = item.nilai_pdn > 0;
      const isUmk = item.nilai_umk > 0;
      const sumberTrans = item.sumber_transaksi || 'Tidak Diketahui';
      const metode = item.metode_pengadaan || 'Tidak Diketahui';
      const jenis = item.jenis_pengadaan || 'Tidak Diketahui';
      const sumberDana = item.sumber_dana || 'Tidak Diketahui';
      const ppk = item.nama_ppk || 'Tidak Diketahui';
      const penyedia = item.nama_penyedia || 'Tidak Diketahui';

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
