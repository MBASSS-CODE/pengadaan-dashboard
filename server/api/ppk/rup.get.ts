import path from 'path';
import { getDataDir } from '../../utils/dataDir';
import { getRekapPpkMergedData, readJsonSafe } from '../../utils/mergeManager';
import { resolvePpkIdentity } from '../../utils/ppkIdentity';
import { matchesRekapPpkRow, matchesRupRow } from '../../utils/ppkMatcher';

export default defineEventHandler(async (event) => {
  const sessionUser = event.context.user as { ppkMasterId?: number | null } | undefined;
  const query = getQuery(event);
  const tahun = String(query.tahun || new Date().getFullYear());
  const tipe = String(query.tipe || 'penyedia') === 'swakelola' ? 'swakelola' : 'penyedia';
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.min(100000, Math.max(1, parseInt(String(query.limit || '25'), 10) || 25));

  const emptyResult = (ppkLinked: boolean) => ({
    success: true,
    ppkLinked,
    tipe,
    data: [],
    meta: {
      totalItems: 0,
      totalPages: 1,
      currentPage: page,
      totalPagu: 0,
      realisasiCount: 0,
      belumJalanCount: 0
    },
    filterOptions: {
      jenisPengadaan: [],
      metodePengadaan: [],
      statusRealisasi: [],
      statusUmumkan: [],
      sumberDana: []
    }
  });

  try {
    const identity = await resolvePpkIdentity(sessionUser?.ppkMasterId);
    if (!identity) {
      return emptyResult(false);
    }

    const fileName =
      tipe === 'swakelola'
        ? `rup-swakelola-enriched_${tahun}.json`
        : `rup-penyedia-enriched_${tahun}.json`;
    const filePath = path.resolve(getDataDir(), 'merged', fileName);
    const [raw, rekapData] = await Promise.all([
      readJsonSafe(filePath) as Promise<any[]>,
      getRekapPpkMergedData(tahun).catch(() => [])
    ]);

    if (!Array.isArray(raw) || raw.length === 0) {
      return emptyResult(true);
    }

    // Ambil peta RUP -> info realisasi lintas sumber dari Rekap PPK milik PPK ini saja
    const myRealizedRupMap = new Map<string, { count: number; nilai: number }>();
    for (const r of rekapData) {
      if (!matchesRekapPpkRow(identity, r)) continue;
      const pkts = Array.isArray(r.detail_paket_list) ? r.detail_paket_list : [];
      for (const p of pkts) {
        const kdRup = String(p.kode_rup || '').trim();
        if (!kdRup) continue;
        const cur = myRealizedRupMap.get(kdRup) || { count: 0, nilai: 0 };
        cur.count += 1;
        cur.nilai += Number(p.total_nilai) || 0;
        myRealizedRupMap.set(kdRup, cur);
      }
    }

    // Filter KETAT milik PPK yang sedang login saja (sebelum ekstrak filterOptions maupun agregasi)
    const myData = raw
      .filter((item: any) => item.status_delete_rup !== true && matchesRupRow(identity, item))
      .map((item: any) => {
        const kdRup = String(item.kd_rup || '').trim();
        const crossReal = myRealizedRupMap.get(kdRup);
        const hasReal =
          tipe === 'swakelola'
            ? Boolean(item._has_pelaksanaan || crossReal)
            : Boolean(item._has_realisasi || item._has_epurchasing || crossReal);
        const unifiedStatus = hasReal ? 'Sudah Terealisasi' : 'Belum Jalan';
        return {
          ...item,
          _ppk_terealisasi: hasReal,
          _ppk_transaksi_count: crossReal?.count || 0,
          _ppk_transaksi_nilai: crossReal?.nilai || 0,
          _ppk_status_realisasi: unifiedStatus
        };
      });

    if (myData.length === 0) {
      return emptyResult(true);
    }

    // Opsi filter hanya dari RUP milik PPK ini
    const jenisSet = new Set<string>();
    const metodeSet = new Set<string>();
    const statusRealSet = new Set<string>();
    const statusUmumkanSet = new Set<string>();
    const sumberDanaSet = new Set<string>();

    for (const item of myData) {
      const jenis = tipe === 'swakelola' ? item.tipe_swakelola_nama || item.tipe_swakelola : item.jenis_pengadaan;
      if (jenis) jenisSet.add(jenis);
      const metode = tipe === 'swakelola' ? 'Swakelola' : item.metode_pengadaan;
      if (metode) metodeSet.add(metode);
      const realStatus = item._ppk_status_realisasi || 'Belum Jalan';
      if (realStatus) statusRealSet.add(realStatus);
      if (item.status_umumkan_rup) statusUmumkanSet.add(item.status_umumkan_rup);
      if (item.sumber_dana_list) {
        for (const sd of String(item.sumber_dana_list).split(',').map((s) => s.trim()).filter(Boolean)) {
          sumberDanaSet.add(sd);
        }
      }
    }

    let filtered = [...myData];

    if (query.search) {
      const s = String(query.search).toLowerCase();
      filtered = filtered.filter(
        (item: any) =>
          (item.nama_paket && item.nama_paket.toLowerCase().includes(s)) ||
          String(item.kd_rup || '').toLowerCase().includes(s) ||
          (item.nama_satker && item.nama_satker.toLowerCase().includes(s))
      );
    }

    const splitParam = (val: unknown) =>
      val ? String(val).split(',').map((s) => s.trim()).filter(Boolean) : [];

    const jenisList = splitParam(query.jenisPengadaan);
    if (jenisList.length > 0) {
      filtered = filtered.filter((item: any) => {
        const j = tipe === 'swakelola' ? item.tipe_swakelola_nama || item.tipe_swakelola : item.jenis_pengadaan;
        return jenisList.includes(j);
      });
    }

    const metodeList = splitParam(query.metodePengadaan);
    if (metodeList.length > 0 && tipe === 'penyedia') {
      filtered = filtered.filter((item: any) => metodeList.includes(item.metode_pengadaan));
    }

    const statusRealList = splitParam(query.statusRealisasi);
    if (statusRealList.length > 0) {
      filtered = filtered.filter((item: any) => {
        const st = item._ppk_status_realisasi || 'Belum Jalan';
        return statusRealList.includes(st);
      });
    }

    const sumberDanaList = splitParam(query.sumberDana);
    if (sumberDanaList.length > 0) {
      filtered = filtered.filter(
        (item: any) =>
          item.sumber_dana_list &&
          sumberDanaList.some((sd) => String(item.sumber_dana_list).includes(sd))
      );
    }

    const um = query.statusUmumkan as string;
    if (um && um !== 'ALL') {
      filtered = filtered.filter((item: any) => item.status_umumkan_rup === um);
    }

    filtered.sort((a: any, b: any) => (Number(b.kd_rup) || 0) - (Number(a.kd_rup) || 0));

    let totalPagu = 0;
    let realisasiCount = 0;
    for (const item of filtered) {
      totalPagu += Number(item.pagu) || 0;
      if (item._ppk_terealisasi) realisasiCount += 1;
    }

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const paginated =
      limit >= 100000
        ? filtered
        : filtered.slice((safePage - 1) * limit, safePage * limit);

    return {
      success: true,
      ppkLinked: true,
      tipe,
      data: paginated,
      meta: {
        totalItems,
        totalPages,
        currentPage: safePage,
        totalPagu,
        realisasiCount,
        belumJalanCount: totalItems - realisasiCount
      },
      filterOptions: {
        jenisPengadaan: Array.from(jenisSet).sort(),
        metodePengadaan: Array.from(metodeSet).sort(),
        statusRealisasi: Array.from(statusRealSet).sort(),
        statusUmumkan: Array.from(statusUmumkanSet).sort(),
        sumberDana: Array.from(sumberDanaSet).sort()
      }
    };
  } catch (error: any) {
    return {
      success: false,
      ppkLinked: true,
      tipe,
      message: error.message || 'Gagal memuat data RUP PPK',
      data: [],
      meta: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        totalPagu: 0,
        realisasiCount: 0,
        belumJalanCount: 0
      },
      filterOptions: {
        jenisPengadaan: [],
        metodePengadaan: [],
        statusRealisasi: [],
        statusUmumkan: [],
        sumberDana: []
      }
    };
  }
});
