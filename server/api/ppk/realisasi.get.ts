import { getRealisasiMasterData } from '../../utils/realisasiMasterMerge';
import { getRekapPpkMergedData } from '../../utils/mergeManager';
import { resolvePpkIdentity } from '../../utils/ppkIdentity';
import { matchesRealisasiRow, matchesRekapPpkRow } from '../../utils/ppkMatcher';

export default defineEventHandler(async (event) => {
  const sessionUser = event.context.user as { ppkMasterId?: number | null } | undefined;
  const query = getQuery(event);
  const tahun = String(query.tahun || new Date().getFullYear());
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.min(100000, Math.max(1, parseInt(String(query.limit || '25'), 10) || 25));

  const emptyResult = (ppkLinked: boolean) => ({
    success: true,
    ppkLinked,
    data: [],
    meta: {
      totalItems: 0,
      totalPages: 1,
      currentPage: page,
      totalNilai: 0,
      totalPagu: 0,
      totalPdn: 0,
      totalUmk: 0
    },
    filterOptions: {
      sumberTransaksi: [],
      metodePengadaan: [],
      penyedia: [],
      sumberDana: [],
      jenisPengadaan: [],
      statusPaket: [],
      tahapanPengadaan: []
    }
  });

  try {
    const identity = await resolvePpkIdentity(sessionUser?.ppkMasterId);
    if (!identity) {
      return emptyResult(false);
    }

    const [unifiedData, rekapData] = await Promise.all([
      getRealisasiMasterData(tahun),
      getRekapPpkMergedData(tahun).catch(() => [])
    ]);

    if (!unifiedData || unifiedData.length === 0) {
      return emptyResult(true);
    }

    // Bangun indeks kepemilikan kode_paket dari Rekap PPK kanonik untuk mencegah kebocoran antar-PPK
    const myCanonicalPakets = new Set<string>();
    const otherCanonicalPakets = new Set<string>();
    for (const r of rekapData) {
      const isMine = matchesRekapPpkRow(identity, r);
      const pkts = Array.isArray(r.detail_paket_list) ? r.detail_paket_list : [];
      for (const p of pkts) {
        const kp = String(p.kode_paket || '');
        if (!kp) continue;
        if (isMine) myCanonicalPakets.add(kp);
        else otherCanonicalPakets.add(kp);
      }
    }

    // Filter KETAT: hanya data milik PPK yang sedang login
    const myData = unifiedData.filter((item: any) => {
      const kp = String(item.kode_paket || '');
      if (kp && myCanonicalPakets.has(kp)) return true;
      if (kp && otherCanonicalPakets.has(kp)) return false;
      return matchesRealisasiRow(identity, item);
    });

    if (myData.length === 0) {
      return emptyResult(true);
    }

    // Kumpulkan opsi filter HANYA dari data milik PPK ini (tanpa daftar PPK lain!)
    const sumberSet = new Set<string>();
    const metodeSet = new Set<string>();
    const penyediaSet = new Set<string>();
    const sumberDanaSet = new Set<string>();
    const jenisPengadaanSet = new Set<string>();
    const statusPaketSet = new Set<string>();
    const tahapanPengadaanSet = new Set<string>();

    for (const item of myData) {
      if (item.sumber_transaksi) sumberSet.add(item.sumber_transaksi);
      if (item.metode_pengadaan) metodeSet.add(item.metode_pengadaan);
      if (item.nama_penyedia && item.nama_penyedia !== '-') penyediaSet.add(item.nama_penyedia);
      if (item.sumber_dana) sumberDanaSet.add(item.sumber_dana);
      const jenis = item.jenis_pengadaan_enriched || item.jenis_pengadaan || '-';
      if (jenis && jenis !== '-') jenisPengadaanSet.add(jenis);
      if (item.status_paket) statusPaketSet.add(item.status_paket);
      if (item.tahapan_pengadaan) tahapanPengadaanSet.add(item.tahapan_pengadaan);
    }

    // Terapkan filter pengguna (tanpa pernah menerima parameter query.ppk!)
    let filteredData = [...myData];

    if (query.filterType === 'tanggal' && query.startDate && query.endDate) {
      const start = new Date(`${query.startDate}T00:00:00`);
      const end = new Date(`${query.endDate}T23:59:59.999`);
      const startMs = !Number.isNaN(start.getTime()) ? start.getTime() : 0;
      const endMs = !Number.isNaN(end.getTime()) ? end.getTime() : Number.MAX_SAFE_INTEGER;
      filteredData = filteredData.filter((item: any) => {
        if (!item._sort_date) return false;
        return item._sort_date >= startMs && item._sort_date <= endMs;
      });
    } else if (query.filterType === 'triwulan' && query.selectedQuarter) {
      const quarterMap: Record<string, number[]> = {
        'TW 1': [0, 1, 2],
        'TW 2': [3, 4, 5],
        'TW 3': [6, 7, 8],
        'TW 4': [9, 10, 11]
      };
      const validMonths = quarterMap[String(query.selectedQuarter)] || [];
      if (validMonths.length > 0) {
        filteredData = filteredData.filter((item: any) => {
          if (!item._sort_date) return false;
          return validMonths.includes(new Date(item._sort_date).getMonth());
        });
      }
    }

    if (query.search) {
      const search = String(query.search).toLowerCase();
      filteredData = filteredData.filter(
        (item: any) =>
          (item.nama_paket && item.nama_paket.toLowerCase().includes(search)) ||
          (item.nama_penyedia && item.nama_penyedia.toLowerCase().includes(search)) ||
          (item.kode_rup && String(item.kode_rup).toLowerCase().includes(search)) ||
          (item.kode_paket && String(item.kode_paket).toLowerCase().includes(search)) ||
          (Array.isArray(item.mak_list) &&
            item.mak_list.some((m: string) => m.toLowerCase().includes(search)))
      );
    }

    const splitParam = (val: unknown) =>
      val ? String(val).split(',').map((s) => s.trim()).filter(Boolean) : [];

    const sumberList = splitParam(query.sumberTransaksi);
    if (sumberList.length > 0) {
      filteredData = filteredData.filter((item: any) => sumberList.includes(item.sumber_transaksi));
    }

    const metodeList = splitParam(query.metodePengadaan);
    if (metodeList.length > 0) {
      filteredData = filteredData.filter((item: any) => metodeList.includes(item.metode_pengadaan));
    }

    const penyediaList = splitParam(query.penyedia);
    if (penyediaList.length > 0) {
      filteredData = filteredData.filter((item: any) => penyediaList.includes(item.nama_penyedia));
    }

    const sumberDanaList = splitParam(query.sumberDana);
    if (sumberDanaList.length > 0) {
      filteredData = filteredData.filter((item: any) => sumberDanaList.includes(item.sumber_dana));
    }

    const jenisList = splitParam(query.jenisPengadaan);
    if (jenisList.length > 0) {
      filteredData = filteredData.filter((item: any) => {
        const j = item.jenis_pengadaan_enriched || item.jenis_pengadaan || '-';
        return jenisList.includes(j) || jenisList.includes(item.jenis_pengadaan);
      });
    }

    const statusPaketList = splitParam(query.statusPaket);
    if (statusPaketList.length > 0) {
      filteredData = filteredData.filter((item: any) => statusPaketList.includes(item.status_paket));
    }

    const tahapanList = splitParam(query.tahapanPengadaan);
    if (tahapanList.length > 0) {
      filteredData = filteredData.filter((item: any) => tahapanList.includes(item.tahapan_pengadaan));
    }

    filteredData.sort((a: any, b: any) => {
      const diff = (b._sort_date || 0) - (a._sort_date || 0);
      return diff !== 0 ? diff : (a._original_index || 0) - (b._original_index || 0);
    });

    let totalNilai = 0;
    let totalPagu = 0;
    let totalPdn = 0;
    let totalUmk = 0;
    for (const item of filteredData) {
      totalNilai += Number(item.total_nilai) || 0;
      totalPagu += Number(item.nilai_pagu) || 0;
      totalPdn += Number(item.nilai_pdn) || 0;
      totalUmk += Number(item.nilai_umk) || 0;
    }

    const totalItems = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const paginatedData =
      limit >= 100000
        ? filteredData
        : filteredData.slice((safePage - 1) * limit, safePage * limit);

    return {
      success: true,
      ppkLinked: true,
      data: paginatedData,
      meta: {
        totalItems,
        totalPages,
        currentPage: safePage,
        totalNilai,
        totalPagu,
        totalPdn,
        totalUmk
      },
      filterOptions: {
        sumberTransaksi: Array.from(sumberSet).sort(),
        metodePengadaan: Array.from(metodeSet).sort(),
        penyedia: Array.from(penyediaSet).sort(),
        sumberDana: Array.from(sumberDanaSet).sort(),
        jenisPengadaan: Array.from(jenisPengadaanSet).sort(),
        statusPaket: Array.from(statusPaketSet).sort(),
        tahapanPengadaan: Array.from(tahapanPengadaanSet).sort()
      }
    };
  } catch (error: any) {
    return {
      success: false,
      ppkLinked: true,
      message: error.message || 'Gagal memuat realisasi PPK',
      data: [],
      meta: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        totalNilai: 0,
        totalPagu: 0,
        totalPdn: 0,
        totalUmk: 0
      },
      filterOptions: {
        sumberTransaksi: [],
        metodePengadaan: [],
        penyedia: [],
        sumberDana: [],
        jenisPengadaan: [],
        statusPaket: [],
        tahapanPengadaan: []
      }
    };
  }
});
