import { getRealisasiMasterData, getRealisasiOfficialSummary } from '../../utils/realisasiMasterMerge';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const [unifiedData, officialSummary] = await Promise.all([
      getRealisasiMasterData(tahun),
      getRealisasiOfficialSummary(tahun)
    ]);

    if (!unifiedData || unifiedData.length === 0) {
      return {
        success: true,
        summary: {
          totalPesanan: 0,
          totalNilai: 0,
          totalPagu: 0,
          totalPdn: 0,
          totalUmk: 0,
          trend: [],
          sumberTransaksi: [],
          metodePengadaan: [],
          jenisPengadaan: [],
          sumberDana: []
        }
      };
    }

    let totalPesanan = 0;
    let totalNilai = 0;
    let totalPagu = 0;
    let totalPdn = 0;
    let totalUmk = 0;

    const trendMap = new Map<string, number>();
    const sumberTransaksiMap = new Map<string, number>();
    const metodeMap = new Map<string, number>();
    const jenisMap = new Map<string, number>();
    const sumberDanaMap = new Map<string, number>();

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    monthNames.forEach(m => trendMap.set(m, 0));

    unifiedData.forEach(item => {
      totalPesanan++;
      const valNilai = Number(item.total_nilai) || 0;
      const valPagu = Number(item.nilai_pagu) || 0;
      const valPdn = Number(item.nilai_pdn) || 0;
      const valUmk = Number(item.nilai_umk) || 0;

      totalNilai += valNilai;
      totalPagu += valPagu;
      totalPdn += valPdn;
      totalUmk += valUmk;

      if (item._sort_date) {
        const d = new Date(item._sort_date);
        if (!isNaN(d.getTime())) {
          const monthName = monthNames[d.getMonth()];
          trendMap.set(monthName, (trendMap.get(monthName) || 0) + valNilai);
        }
      }

      const addGroup = (mapObj: Map<string, number>, key: string | undefined, val: number) => {
        const k = key && key.trim() ? key.trim() : 'Tidak Diketahui';
        mapObj.set(k, (mapObj.get(k) || 0) + val);
      };

      addGroup(sumberTransaksiMap, item.sumber_transaksi, valNilai);
      addGroup(metodeMap, item.metode_pengadaan, valNilai);
      addGroup(jenisMap, item.jenis_pengadaan_enriched || item.jenis_pengadaan || 'Belum Terklasifikasi', valNilai);
      addGroup(sumberDanaMap, item.sumber_dana, valNilai);
    });

    const formatResult = (mapObj: Map<string, number>) =>
      Array.from(mapObj.entries()).map(([label, total]) => ({ label, total }));

    const sortResult = (arr: { label: string; total: number }[]) =>
      arr.sort((a, b) => b.total - a.total);

    return {
      success: true,
      summary: {
        totalPesanan: officialSummary?.jumlah_paket ?? totalPesanan,
        totalNilai: officialSummary?.total_nilai ?? totalNilai,
        totalPagu,
        totalPdn,
        totalUmk,
        trend: formatResult(trendMap),
        sumberTransaksi: sortResult(formatResult(sumberTransaksiMap)),
        metodePengadaan: sortResult(formatResult(metodeMap)),
        jenisPengadaan: sortResult(formatResult(jenisMap)),
        sumberDana: sortResult(formatResult(sumberDanaMap))
      }
    };
  } catch (error: any) {
    console.error('API analytics realisasi error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan'
    };
  }
});
