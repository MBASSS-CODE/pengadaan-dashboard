import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'merged', `nontender_enriched_${tahun}.json`);
    const data = await readJsonSafe(filePath);

    if (!data) {
      return {
        success: false,
        message: 'Data belum di-merge atau tidak tersedia.',
        summary: null
      };
    }

    // Define type for map entries
    type MapEntry = { count: number; pagu: number; hps: number; _idx?: number };
    type SummaryMap = Record<string, MapEntry>;

    // Initialize maps
    const maps: {
      status: SummaryMap;
      metode: SummaryMap;
      jenis: SummaryMap;
      pdn: SummaryMap;
      ukm: SummaryMap;
      satker: SummaryMap;
      ppk: SummaryMap;
      kajiUlang: SummaryMap;
      deviasi: SummaryMap;
    } = {
      status: {},
      metode: {},
      jenis: {},
      pdn: { 'PDN': { count: 0, pagu: 0, hps: 0 }, 'Non-PDN': { count: 0, pagu: 0, hps: 0 } },
      ukm: { 'UKM': { count: 0, pagu: 0, hps: 0 }, 'Non-UKM': { count: 0, pagu: 0, hps: 0 } },
      satker: {},
      ppk: {},
      kajiUlang: { 'Ada Kaji Ulang': { count: 0, pagu: 0, hps: 0 }, 'Tanpa Revisi': { count: 0, pagu: 0, hps: 0 } },
      deviasi: { 'Sesuai (HPS = Pagu)': { count: 0, pagu: 0, hps: 0 }, 'Overbudget (HPS > Pagu)': { count: 0, pagu: 0, hps: 0 }, 'Underbudget (HPS < Pagu)': { count: 0, pagu: 0, hps: 0 } }
    };

    let totalPagu = 0;
    let totalHps = 0;
    let totalItems = data.length;
    let ppkCompletedCount = 0;
    let rupMatchedCount = 0;

    for (const item of data) {
      const hps = Number(item.hps) || 0;
      const pagu = Number(item.rup_pagu) || 0;
      
      totalHps += hps;
      if (item._rup_matched) {
        totalPagu += pagu;
        rupMatchedCount++;
      }
      
      if (item._ppk_completed) ppkCompletedCount++;

      // 1. Status
      const s = item.status_nontender || 'Tidak Ditetapkan';
      if (!maps.status[s]) maps.status[s] = { count: 0, pagu: 0, hps: 0 };
      maps.status[s]!.count++;
      maps.status[s]!.pagu += pagu;
      maps.status[s]!.hps += hps;

      // 2. Metode
      const m = item.mtd_pemilihan || 'Tidak Ditetapkan';
      if (!maps.metode[m]) maps.metode[m] = { count: 0, pagu: 0, hps: 0 };
      maps.metode[m]!.count++;
      maps.metode[m]!.pagu += pagu;
      maps.metode[m]!.hps += hps;

      // 3. Jenis
      const j = item.jenis_pengadaan || 'Tidak Ditetapkan';
      if (!maps.jenis[j]) maps.jenis[j] = { count: 0, pagu: 0, hps: 0 };
      maps.jenis[j]!.count++;
      maps.jenis[j]!.pagu += pagu;
      maps.jenis[j]!.hps += hps;

      // 4. PDN (berdasarkan RUP jika ada)
      if (item._rup_matched) {
        const pdnKey = (item.rup_status_pdn === 'PDN') ? 'PDN' : 'Non-PDN';
        if (!maps.pdn[pdnKey]) maps.pdn[pdnKey] = { count: 0, pagu: 0, hps: 0 };
        maps.pdn[pdnKey]!.count++;
        maps.pdn[pdnKey]!.pagu += pagu;
        maps.pdn[pdnKey]!.hps += hps;
        
        // 5. UKM
        const ukmKey = (item.rup_status_ukm === 'Usaha Kecil') ? 'UKM' : 'Non-UKM';
        if (!maps.ukm[ukmKey]) maps.ukm[ukmKey] = { count: 0, pagu: 0, hps: 0 };
        maps.ukm[ukmKey]!.count++;
        maps.ukm[ukmKey]!.pagu += pagu;
        maps.ukm[ukmKey]!.hps += hps;
        
        // 6. Deviasi
        let devKey = 'Sesuai (HPS = Pagu)';
        if (hps > pagu) devKey = 'Overbudget (HPS > Pagu)';
        else if (hps < pagu) devKey = 'Underbudget (HPS < Pagu)';
        
        if (!maps.deviasi[devKey]) maps.deviasi[devKey] = { count: 0, pagu: 0, hps: 0 };
        maps.deviasi[devKey]!.count++;
        maps.deviasi[devKey]!.pagu += pagu;
        maps.deviasi[devKey]!.hps += hps;
      }

      // 7. Satker
      const satker = item.nama_satker || 'Tidak Ditetapkan';
      if (!maps.satker[satker]) maps.satker[satker] = { count: 0, pagu: 0, hps: 0 };
      maps.satker[satker]!.count++;
      maps.satker[satker]!.pagu += pagu;
      maps.satker[satker]!.hps += hps;

      // 8. Kaji Ulang
      const kajiUlangKey = item._has_kaji_ulang ? 'Ada Kaji Ulang' : 'Tanpa Revisi';
      if (!maps.kajiUlang[kajiUlangKey]) maps.kajiUlang[kajiUlangKey] = { count: 0, pagu: 0, hps: 0 };
      maps.kajiUlang[kajiUlangKey]!.count++;
      maps.kajiUlang[kajiUlangKey]!.pagu += pagu;
      maps.kajiUlang[kajiUlangKey]!.hps += hps;

      // 9. PPK
      if (item._ppk_completed && item.ppk_nama_lengkap) {
        const ppkName = item.ppk_nama_lengkap;
        if (!maps.ppk[ppkName]) maps.ppk[ppkName] = { count: 0, pagu: 0, hps: 0 };
        maps.ppk[ppkName]!.count++;
        maps.ppk[ppkName]!.pagu += pagu;
        maps.ppk[ppkName]!.hps += hps;
      }
    }

    // Helper to sort objects into array
    const buildArray = (mapObj: SummaryMap, totalVal: number, useHps = false) => {
      return Object.keys(mapObj).map(key => {
        const item = mapObj[key]!;
        return {
          label: key,
          count: item.count,
          pagu: item.pagu,
          hps: item.hps,
          persentase: ((item[useHps ? 'hps' : 'pagu'] / (totalVal || 1)) * 100).toFixed(2) + '%'
        };
      }).sort((a, b) => (useHps ? b.hps - a.hps : b.pagu - a.pagu));
    };

    return {
      success: true,
      summary: {
        totalItems,
        totalPagu,
        totalHps,
        ppkCompletedCount,
        rupMatchedCount,
        status: buildArray(maps.status, totalHps, true),
        metode: buildArray(maps.metode, totalHps, true),
        jenis: buildArray(maps.jenis, totalHps, true),
        pdn: buildArray(maps.pdn, totalPagu, false),
        ukm: buildArray(maps.ukm, totalPagu, false),
        satker: buildArray(maps.satker, totalHps, true).slice(0, 50), // Top 50 satker by HPS
        ppk: buildArray(maps.ppk, totalHps, true), // All PPKs (will be sliced/sorted by frontend)
        kajiUlang: buildArray(maps.kajiUlang, totalHps, true),
        deviasi: buildArray(maps.deviasi, totalHps, true)
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal memuat data ringkasan analytics.',
      error: error.message
    };
  }
});
