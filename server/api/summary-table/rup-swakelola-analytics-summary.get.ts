import { getDataDir } from '../../utils/dataDir';
import path from 'path';
import { readJsonSafe } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const filePath = path.resolve(getDataDir(), 'merged', `rup-swakelola-enriched_${tahun}.json`);
    const data = await readJsonSafe(filePath);

    if (!data) {
      return {
        success: false,
        message: 'Data belum di-merge atau tidak tersedia.',
        summary: null
      };
    }

    type MapEntry = { count: number; pagu: number; _idx?: number };
    type SummaryMap = Record<string, MapEntry>;

    const maps: {
      tipe: SummaryMap;
      statusPelaksanaan: SummaryMap;
      sumberDana: SummaryMap;
      satker: SummaryMap;
      ppk: SummaryMap;
      kajiUlang: SummaryMap;
      statusUmumkan: SummaryMap;
    } = {
      tipe: {},
      statusPelaksanaan: { 'Tercatat': { count: 0, pagu: 0 }, 'Belum Tercatat': { count: 0, pagu: 0 } },
      sumberDana: {},
      satker: {},
      ppk: {},
      kajiUlang: { 'Ada Kaji Ulang': { count: 0, pagu: 0 }, 'Tanpa Revisi': { count: 0, pagu: 0 } },
      statusUmumkan: { 'Terumumkan': { count: 0, pagu: 0 }, 'Belum Terumumkan': { count: 0, pagu: 0 } }
    };

    let totalPagu = 0;
    let totalItems = data.length;
    let ppkCompletedCount = 0;
    let tercatatCount = 0;
    let terumumkanCount = 0;

    for (const item of data) {
      const pagu = Number(item.pagu) || 0;
      totalPagu += pagu;
      
      if (item._ppk_completed) ppkCompletedCount++;
      if (item._has_pelaksanaan) tercatatCount++;
      if (item.status_umumkan_rup === 'Sudah' || item.status_umumkan_rup === 'Terumumkan') terumumkanCount++;

      // 1. Tipe Swakelola
      const t = `Tipe ${item.tipe_swakelola || 'Tidak Diketahui'}`;
      if (!maps.tipe[t]) maps.tipe[t] = { count: 0, pagu: 0 };
      maps.tipe[t]!.count++;
      maps.tipe[t]!.pagu += pagu;

      // 2. Status Pelaksanaan
      const sp = item._has_pelaksanaan ? 'Tercatat' : 'Belum Tercatat';
      if (!maps.statusPelaksanaan[sp]) maps.statusPelaksanaan[sp] = { count: 0, pagu: 0 };
      maps.statusPelaksanaan[sp]!.count++;
      maps.statusPelaksanaan[sp]!.pagu += pagu;

      // 3. Sumber Dana
      if (item.sumber_dana_list) {
        const sds = item.sumber_dana_list.split(', ');
        for (const sd of sds) {
          if (!maps.sumberDana[sd]) maps.sumberDana[sd] = { count: 0, pagu: 0 };
          maps.sumberDana[sd]!.count++;
          maps.sumberDana[sd]!.pagu += pagu;
        }
      } else {
        if (!maps.sumberDana['Tidak Ditetapkan']) maps.sumberDana['Tidak Ditetapkan'] = { count: 0, pagu: 0 };
        maps.sumberDana['Tidak Ditetapkan']!.count++;
        maps.sumberDana['Tidak Ditetapkan']!.pagu += pagu;
      }

      // 4. Kaji Ulang
      const ku = item._has_kaji_ulang ? 'Ada Kaji Ulang' : 'Tanpa Revisi';
      if (!maps.kajiUlang[ku]) maps.kajiUlang[ku] = { count: 0, pagu: 0 };
      maps.kajiUlang[ku]!.count++;
      maps.kajiUlang[ku]!.pagu += pagu;

      // 5. Status Umumkan
      const su = (item.status_umumkan_rup === 'Sudah' || item.status_umumkan_rup === 'Terumumkan') ? 'Terumumkan' : 'Belum Terumumkan';
      if (!maps.statusUmumkan[su]) maps.statusUmumkan[su] = { count: 0, pagu: 0 };
      maps.statusUmumkan[su]!.count++;
      maps.statusUmumkan[su]!.pagu += pagu;

      // 6. Satker
      const satker = item.nama_satker || 'Tidak Ditetapkan';
      if (!maps.satker[satker]) maps.satker[satker] = { count: 0, pagu: 0 };
      maps.satker[satker]!.count++;
      maps.satker[satker]!.pagu += pagu;

      // 7. PPK
      if (item._ppk_completed && item.ppk_nama_lengkap) {
        const ppkName = item.ppk_nama_lengkap;
        if (!maps.ppk[ppkName]) maps.ppk[ppkName] = { count: 0, pagu: 0 };
        maps.ppk[ppkName]!.count++;
        maps.ppk[ppkName]!.pagu += pagu;
      }
    }

    const buildArray = (mapObj: SummaryMap, totalVal: number) => {
      return Object.keys(mapObj).map(key => {
        const item = mapObj[key]!;
        return {
          label: key,
          count: item.count,
          pagu: item.pagu,
          persentase: ((item.pagu / (totalVal || 1)) * 100).toFixed(2) + '%'
        };
      }).sort((a, b) => b.pagu - a.pagu);
    };

    return {
      success: true,
      summary: {
        totalItems,
        totalPagu,
        ppkCompletedCount,
        tercatatCount,
        tercatatPercentage: ((tercatatCount / (totalItems || 1)) * 100).toFixed(1) + '%',
        terumumkanCount,
        terumumkanPercentage: ((terumumkanCount / (totalItems || 1)) * 100).toFixed(1) + '%',
        byTipe: buildArray(maps.tipe, totalPagu),
        byStatusPelaksanaan: buildArray(maps.statusPelaksanaan, totalPagu),
        bySumberDana: buildArray(maps.sumberDana, totalPagu),
        byKajiUlang: buildArray(maps.kajiUlang, totalPagu),
        byStatusUmumkan: buildArray(maps.statusUmumkan, totalPagu),
        topSatker: buildArray(maps.satker, totalPagu).slice(0, 5),
        topPpk: buildArray(maps.ppk, totalPagu).slice(0, 5)
      }
    };

  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return {
      success: false,
      message: error.message || 'Internal Server Error'
    };
  }
});
