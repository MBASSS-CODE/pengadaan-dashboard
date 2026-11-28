import { getRekapPpkMergedData } from '../../utils/mergeManager';
import {
  aggregatePpkMetrics,
  DEFAULT_ACUAN_SUMBER,
  type PpkPacketDetail,
  type PpkRupDetail
} from '../../utils/rekapPpkMerge';
import { resolvePpkIdentity } from '../../utils/ppkIdentity';
import { matchesRekapPpkRow } from '../../utils/ppkMatcher';

const BULAN_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export default defineEventHandler(async (event) => {
  const sessionUser = event.context.user as { ppkMasterId?: number | null } | undefined;
  const query = getQuery(event);
  const tahun = String(query.tahun || new Date().getFullYear());
  const scopeMode = String(query.scopeMode || 'acuan') === 'all' ? 'all' : 'acuan';
  const filterType = String(query.filterType || 'semua');
  const startDate = String(query.startDate || '');
  const endDate = String(query.endDate || '');
  const selectedQuarter = String(query.selectedQuarter || 'TW 1');
  const includeDetails = String(query.includeDetails || '') === '1';

  try {
    const identity = await resolvePpkIdentity(sessionUser?.ppkMasterId);
    if (!identity) {
      return {
        success: true,
        ppkLinked: false,
        scopeMode,
        profile: null,
        metrics: null,
        charts: null,
        globalBenchmark: null
      };
    }

    const rawData: any[] = await getRekapPpkMergedData(tahun);

    const hasDateFilter = filterType === 'tanggal' && Boolean(startDate || endDate);
    const hasQuarterFilter = filterType === 'triwulan' && Boolean(selectedQuarter);

    let startMs = 0;
    let endMs = Number.MAX_SAFE_INTEGER;
    if (hasDateFilter) {
      if (startDate) {
        const d = new Date(`${startDate}T00:00:00`);
        if (!Number.isNaN(d.getTime())) startMs = d.getTime();
      }
      if (endDate) {
        const d = new Date(`${endDate}T23:59:59.999`);
        if (!Number.isNaN(d.getTime())) endMs = d.getTime();
      }
    } else if (hasQuarterFilter) {
      const yr = Number(tahun) || new Date().getFullYear();
      const qBounds: Record<string, [number, number]> = {
        'TW 1': [0, 2],
        'TW 2': [3, 5],
        'TW 3': [6, 8],
        'TW 4': [9, 11],
        Q1: [0, 2],
        Q2: [3, 5],
        Q3: [6, 8],
        Q4: [9, 11]
      };
      const [mStart, mEnd] = qBounds[selectedQuarter] || [0, 11];
      startMs = new Date(yr, mStart, 1, 0, 0, 0, 0).getTime();
      endMs = new Date(yr, mEnd + 1, 0, 23, 59, 59, 999).getTime();
    }

    const filterPacketsByScopeAndPeriod = (allPackets: PpkPacketDetail[]) =>
      allPackets.filter((pkt) => {
        if (scopeMode === 'acuan' && pkt.sumber_transaksi !== DEFAULT_ACUAN_SUMBER) {
          return false;
        }
        if (hasDateFilter || hasQuarterFilter) {
          if (!pkt._sort_date || pkt._sort_date <= 0) return false;
          if (pkt._sort_date < startMs || pkt._sort_date > endMs) return false;
        }
        return true;
      });

    // Hitung agregat makro global (HANYA angka total instansi, tanpa nama/detail PPK lain)
    let globalTotalNilaiRealisasi = 0;
    let globalTotalRupTerumumkanNilai = 0;
    let globalTotalKodePaket = 0;

    const matchedRows: any[] = [];
    for (const row of rawData) {
      const isMine = matchesRekapPpkRow(identity, row);
      if (isMine) matchedRows.push(row);

      if (row.ppk_key === 'UNASSIGNED' && Number(row.total_kode_paket || 0) === 0) {
        continue;
      }

      const rowRups: PpkRupDetail[] = Array.isArray(row.detail_rup_list) ? row.detail_rup_list : [];
      const rowPackets = filterPacketsByScopeAndPeriod(
        Array.isArray(row.detail_paket_list) ? row.detail_paket_list : []
      );
      if (!hasDateFilter && !hasQuarterFilter && scopeMode === 'acuan' && rowPackets.length === 0) {
        continue;
      }

      const rowLookup = new Map<string, PpkRupDetail>();
      for (const r of rowRups) rowLookup.set(r.kd_rup, r);
      const agg = aggregatePpkMetrics(row, rowRups, rowPackets, rowLookup);
      globalTotalNilaiRealisasi += Number(agg.total_nilai_realisasi) || 0;
      globalTotalRupTerumumkanNilai += Number(agg.total_rup_terumumkan_nilai) || 0;
      globalTotalKodePaket += Number(agg.total_kode_paket) || 0;
    }

    // Gabungkan RUP & Paket milik PPK yang login saja
    const myRupMap = new Map<string, PpkRupDetail>();
    const myAllPacketsMap = new Map<string, PpkPacketDetail>();
    let baseProfile: any = null;

    for (const row of matchedRows) {
      if (!baseProfile) baseProfile = row;
      const rups: PpkRupDetail[] = Array.isArray(row.detail_rup_list) ? row.detail_rup_list : [];
      for (const r of rups) {
        if (!myRupMap.has(r.kd_rup)) {
          myRupMap.set(r.kd_rup, { ...r });
        }
      }
      const pkts: PpkPacketDetail[] = Array.isArray(row.detail_paket_list) ? row.detail_paket_list : [];
      for (let i = 0; i < pkts.length; i++) {
        const pkt = pkts[i]!;
        const dedupKey = `${pkt.kode_paket}__${pkt.kode_rup}__${pkt.total_nilai}__${pkt.nama_paket}`;
        if (!myAllPacketsMap.has(dedupKey)) {
          myAllPacketsMap.set(dedupKey, pkt);
        }
      }
    }

    const myRupList = Array.from(myRupMap.values()).sort((a, b) => b.pagu - a.pagu);
    const myAllPackets = Array.from(myAllPacketsMap.values()).sort(
      (a, b) => (b._sort_date || 0) - (a._sort_date || 0)
    );
    const myFilteredPackets = filterPacketsByScopeAndPeriod(myAllPackets);

    const myProfileBase = {
      ppk_key: baseProfile?.ppk_key || (identity.nipAsli ? `NIP:${identity.nipAsli}` : `MASTER:${identity.ppkMasterId}`),
      nama: identity.namaLengkap,
      nip_asli: identity.nipAsli,
      nip_nama_masked: baseProfile?.nip_nama_masked || '',
      jabatan: identity.jabatan || baseProfile?.jabatan || '',
      unit_kerja: identity.unitKerja || baseProfile?.unit_kerja || '',
      telepon: identity.telepon || baseProfile?.telepon || '',
      email: identity.email || baseProfile?.email || '',
      nama_instansi: baseProfile?.nama_instansi || 'KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI',
      nama_satuan_kerja: baseProfile?.nama_satuan_kerja || 'MENTERI NEGARA PENDAYAGUNAAN APARATUR NEGARA',
      is_ppk_completed: true
    };

    const myMetrics = aggregatePpkMetrics(myProfileBase, myRupList, myFilteredPackets, myRupMap);

    // Chart aggregations khusus milik PPK ini
    const sumberMap = new Map<string, { label: string; count: number; nilai: number }>();
    const metodeMap = new Map<string, { label: string; count: number; nilai: number }>();
    const jenisMap = new Map<string, { label: string; count: number; nilai: number }>();
    const monthlyTrend = BULAN_NAMES.map((label) => ({ label, count: 0, nilai: 0 }));

    // Sumber transaksi breakdown dihitung untuk periode terpilih (semua sumber milik PPK ini)
    const periodPacketsAllSources = myAllPackets.filter((pkt) => {
      if (hasDateFilter || hasQuarterFilter) {
        if (!pkt._sort_date || pkt._sort_date <= 0) return false;
        if (pkt._sort_date < startMs || pkt._sort_date > endMs) return false;
      }
      return true;
    });
    for (const pkt of periodPacketsAllSources) {
      const sKey = pkt.sumber_transaksi || 'Lainnya';
      const cur = sumberMap.get(sKey) || { label: sKey, count: 0, nilai: 0 };
      cur.count += 1;
      cur.nilai += Number(pkt.total_nilai) || 0;
      sumberMap.set(sKey, cur);
    }

    for (const pkt of myFilteredPackets) {
      const mKey = pkt.metode_pengadaan || 'Lainnya';
      const mCur = metodeMap.get(mKey) || { label: mKey, count: 0, nilai: 0 };
      mCur.count += 1;
      mCur.nilai += Number(pkt.total_nilai) || 0;
      metodeMap.set(mKey, mCur);

      const jKey = pkt.jenis_pengadaan || 'Lainnya';
      const jCur = jenisMap.get(jKey) || { label: jKey, count: 0, nilai: 0 };
      jCur.count += 1;
      jCur.nilai += Number(pkt.total_nilai) || 0;
      jenisMap.set(jKey, jCur);

      if (pkt._sort_date && pkt._sort_date > 0) {
        const d = new Date(pkt._sort_date);
        const monthIdx = d.getMonth();
        if (!Number.isNaN(monthIdx) && monthlyTrend[monthIdx]) {
          monthlyTrend[monthIdx]!.count += 1;
          monthlyTrend[monthIdx]!.nilai += Number(pkt.total_nilai) || 0;
        }
      }
    }

    const sortByNilai = (arr: Array<{ label: string; count: number; nilai: number }>) =>
      arr.sort((a, b) => b.nilai - a.nilai);

    const myRealisasi = Number(myMetrics.total_nilai_realisasi) || 0;
    const myRupNilai = Number(myMetrics.total_rup_terumumkan_nilai) || 0;

    return {
      success: true,
      ppkLinked: true,
      scopeMode,
      profile: myProfileBase,
      metrics: myMetrics,
      charts: {
        tahapan: [
          {
            label: 'Pemilihan Berlangsung',
            count: myMetrics.paket_pemilihan_berlangsung,
            nilai: myMetrics.nilai_pemilihan_berlangsung
          },
          {
            label: 'Pemilihan Selesai',
            count: myMetrics.paket_pemilihan_selesai,
            nilai: myMetrics.nilai_pemilihan_selesai
          },
          {
            label: 'Kontrak',
            count: myMetrics.paket_kontrak,
            nilai: myMetrics.nilai_kontrak
          },
          {
            label: 'Selesai',
            count: myMetrics.paket_selesai,
            nilai: myMetrics.nilai_selesai
          }
        ],
        sumber: sortByNilai(Array.from(sumberMap.values())),
        metode: sortByNilai(Array.from(metodeMap.values())),
        jenis: sortByNilai(Array.from(jenisMap.values())),
        trend: monthlyTrend
      },
      globalBenchmark: {
        globalTotalNilaiRealisasi,
        globalTotalRupTerumumkanNilai,
        globalTotalKodePaket,
        persentaseKontribusiRealisasi:
          globalTotalNilaiRealisasi > 0
            ? Math.round((myRealisasi / globalTotalNilaiRealisasi) * 1000) / 10
            : 0,
        persentaseKontribusiRup:
          globalTotalRupTerumumkanNilai > 0
            ? Math.round((myRupNilai / globalTotalRupTerumumkanNilai) * 1000) / 10
            : 0
      },
      ...(includeDetails
        ? {
            detailRupList: myRupList,
            detailPaketList: myFilteredPackets
          }
        : {})
    };
  } catch (error: any) {
    return {
      success: false,
      ppkLinked: true,
      scopeMode,
      message: error.message || 'Gagal memuat data PPK',
      profile: null,
      metrics: null,
      charts: null,
      globalBenchmark: null
    };
  }
});
