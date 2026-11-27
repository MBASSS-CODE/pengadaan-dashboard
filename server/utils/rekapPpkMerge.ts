import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { loadPpkMaster } from './ppkManager';
import { loadPenyediaMaster } from './penyediaManager';

const dataDir = path.resolve(process.cwd(), 'server/data');
const mergedDir = path.resolve(dataDir, 'merged');

export const REKAP_PPK_SCHEMA_VERSION = 2;
export const DEFAULT_ACUAN_SUMBER = 'E-Katalog Versi 6.0';

let rekapPpkCache: Record<string, any[]> = {};
const rekapPpkBuildMtime: Record<string, number> = {};

export const invalidateRekapPpkCache = () => {
  rekapPpkCache = {};
  for (const key of Object.keys(rekapPpkBuildMtime)) {
    delete rekapPpkBuildMtime[key];
  }
};

const readJsonRawSafe = async <T = any>(filePath: string): Promise<T | null> => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const readDataArraySafe = async (filePath: string): Promise<any[]> => {
  const parsed = await readJsonRawSafe<any>(filePath);
  if (!parsed) return [];
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.data)) return parsed.data;
  return [];
};

const normalizeText = (val?: string | null): string => {
  if (!val) return '';
  return String(val).replace(/\s+/g, ' ').trim();
};

const stripAcademicTitle = (name?: string | null): string => {
  if (!name) return '';
  // Hapus gelar di belakang koma, misal "Nisa Nurrela, A.Md." -> "Nisa Nurrela"
  return normalizeText(String(name).split(',')[0]);
};

const normalizeNameKey = (name?: string | null): string => {
  return stripAcademicTitle(name).toLowerCase();
};

const matchesMaskedName = (maskedName?: string | null, fullName?: string | null): boolean => {
  const mWords = normalizeText(maskedName).toLowerCase().split(' ').filter(Boolean);
  const fWords = normalizeNameKey(fullName).split(' ').filter(Boolean);
  if (mWords.length === 0 || mWords.length !== fWords.length) return false;
  return mWords.every((mw, idx) => mw.length === fWords[idx].length && mw[0] === fWords[idx][0]);
};

const isRupTerumumkanAktif = (r: any): boolean => {
  if (!r) return false;
  return (
    r.status_umumkan_rup === 'Terumumkan' &&
    r.status_aktif_rup === true &&
    r.status_delete_rup !== true
  );
};

const mapTahapanRekapFromRealisasi = (
  tahapanPengadaan?: string,
  statusPaket?: string
): PpkPacketDetail['tahapan_rekap'] => {
  const t = String(tahapanPengadaan || '').toLowerCase();
  const s = String(statusPaket || '').toLowerCase();
  if (t.includes('serah terima') || t === 'selesai' || t.includes('paket selesai') || s === 'completed') {
    return 'selesai';
  }
  if (t.includes('pemilihan selesai') || t.includes('evaluasi') || t.includes('penetapan')) {
    return 'pemilihan_selesai';
  }
  if (t.includes('pemilihan berlangsung') || t.includes('pengumuman') || t.includes('negosiasi')) {
    return 'pemilihan_berlangsung';
  }
  return 'kontrak';
};

export interface RekapPpkSourceCheck {
  group: string;
  endpoint: string;
  label: string;
  required: boolean;
  found: boolean;
  count: number;
}

export const checkRekapPpkPrerequisitesRaw = async (tahun: string) => {
  const sources = [
    { group: 'dashboard', endpoint: 'realisasi/table', label: 'Dashboard Realisasi Table (Acuan)', required: true },
    { group: 'rup', endpoint: 'paket-penyedia', label: 'RUP Paket Penyedia', required: true },
    { group: 'rup', endpoint: 'paket-swakelola', label: 'RUP Paket Swakelola', required: false },
    { group: 'ekatalog', endpoint: 'paket-e-purchasing', label: 'E-Purchasing (V6)', required: false },
    { group: 'ekatalog-archive', endpoint: 'paket-e-purchasing', label: 'E-Purchasing Archive (V5)', required: false },
    { group: 'tender', endpoint: 'non-tender-pengumuman', label: 'Non-Tender Pengumuman', required: false },
    { group: 'tender', endpoint: 'pencatatan-non-tender', label: 'Pencatatan Non-Tender', required: false },
    { group: 'tender', endpoint: 'pencatatan-non-tender-realisasi', label: 'Realisasi Pencatatan Non-Tender', required: false },
    { group: 'tender', endpoint: 'pengumuman', label: 'Pengumuman Tender', required: false },
    { group: 'tender', endpoint: 'pencatatan-swakelola', label: 'Pencatatan Swakelola', required: false },
    { group: 'rup', endpoint: 'master-satker', label: 'Master Satker', required: false },
    { group: 'rup', endpoint: 'history-kaji-ulang', label: 'History Kaji Ulang', required: false }
  ];

  const results: RekapPpkSourceCheck[] = [];
  let allRequiredFound = true;

  for (const src of sources) {
    const filePath = path.resolve(dataDir, `${src.group}/${src.endpoint}_${tahun}.json`);
    let found = false;
    let count = 0;
    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        found = true;
        const rows = await readDataArraySafe(filePath);
        count = rows.length;
      }
    } catch {
      // file not found
    }

    if (src.required && !found) allRequiredFound = false;
    results.push({ ...src, found, count });
  }

  // Check PPK Master (MariaDB)
  let ppkCount = 0;
  let ppkFound = false;
  try {
    const ppkData = await loadPpkMaster();
    ppkCount = ppkData.length;
    ppkFound = ppkCount > 0;
  } catch { /* ignore */ }
  results.push({
    group: 'master',
    endpoint: 'ppk-master',
    label: 'Master PPK (MariaDB)',
    required: false,
    found: ppkFound,
    count: ppkCount
  });

  // Check Penyedia Master (MariaDB)
  let penyediaCount = 0;
  let penyediaFound = false;
  try {
    const penyediaData = await loadPenyediaMaster();
    penyediaCount = penyediaData.length;
    penyediaFound = penyediaCount > 0;
  } catch { /* ignore */ }
  results.push({
    group: 'master',
    endpoint: 'penyedia-master',
    label: 'Master Penyedia (MariaDB)',
    required: false,
    found: penyediaFound,
    count: penyediaCount
  });

  return { sources: results, allRequiredFound };
};

export interface PpkPacketDetail {
  kode_paket: string;
  kode_rup: string;
  nama_paket: string;
  sumber_transaksi: string;
  metode_pengadaan: string;
  jenis_pengadaan: string;
  sumber_dana: string;
  nama_penyedia: string;
  status_paket: string;
  tahapan_pengadaan: string;
  tahapan_rekap: 'pemilihan_berlangsung' | 'pemilihan_selesai' | 'kontrak' | 'selesai';
  total_nilai: number;
  nilai_pdn: number;
  nilai_umk: number;
  rup_pagu: number;
  rup_terumumkan: boolean;
  _sort_date: number;
}

export interface PpkRupDetail {
  kd_rup: string;
  nama_paket: string;
  tipe_paket: 'Penyedia' | 'Swakelola';
  pagu: number;
  jenis_pengadaan: string;
  metode_pengadaan: string;
  status_umumkan_rup: string;
  status_aktif_rup: boolean;
  status_delete_rup: boolean;
  is_terumumkan_aktif: boolean;
  status_pdn: string;
  status_ukm: string;
  kaji_ulang_count: number;
  transaksi_count: number;
  transaksi_nilai: number;
}

/**
 * Pure aggregation helper: computes summary metrics for a PPK record from its RUPs and filtered packets.
 * Used both during merge generation and during dynamic runtime filtering (e.g. by scopeMode, sumberTransaksi, or tanggal).
 */
export const aggregatePpkMetrics = (
  baseProfile: any,
  rupList: PpkRupDetail[],
  paketList: PpkPacketDetail[],
  rupLookupMap?: Map<string, PpkRupDetail>
) => {
  const uniqueRupWithTx = new Set<string>();
  const uniqueKodePaket = new Set<string>();
  const uniquePenyedia = new Set<string>();
  const breakdownSumber: Record<string, { count: number; nilai: number }> = {};

  let nilaiPemilihanBerlangsung = 0;
  let paketPemilihanBerlangsung = 0;
  let nilaiPemilihanSelesai = 0;
  let paketPemilihanSelesai = 0;
  let nilaiKontrak = 0;
  let paketKontrak = 0;
  let nilaiSelesai = 0;
  let paketSelesai = 0;
  let totalNilaiPdn = 0;
  let totalNilaiUmk = 0;

  for (const pkt of paketList) {
    if (pkt.kode_paket) uniqueKodePaket.add(pkt.kode_paket);
    if (pkt.kode_rup && pkt.rup_terumumkan) uniqueRupWithTx.add(pkt.kode_rup);
    if (pkt.nama_penyedia && pkt.nama_penyedia !== '-' && pkt.nama_penyedia !== 'SWAKELOLA') {
      uniquePenyedia.add(pkt.nama_penyedia);
    }

    const val = Number(pkt.total_nilai) || 0;
    totalNilaiPdn += Number(pkt.nilai_pdn) || 0;
    totalNilaiUmk += Number(pkt.nilai_umk) || 0;

    if (!breakdownSumber[pkt.sumber_transaksi]) {
      breakdownSumber[pkt.sumber_transaksi] = { count: 0, nilai: 0 };
    }
    breakdownSumber[pkt.sumber_transaksi].count += 1;
    breakdownSumber[pkt.sumber_transaksi].nilai += val;

    if (pkt.tahapan_rekap === 'pemilihan_berlangsung') {
      paketPemilihanBerlangsung++;
      nilaiPemilihanBerlangsung += val;
    } else if (pkt.tahapan_rekap === 'pemilihan_selesai') {
      paketPemilihanSelesai++;
      nilaiPemilihanSelesai += val;
    } else if (pkt.tahapan_rekap === 'kontrak') {
      paketKontrak++;
      nilaiKontrak += val;
    } else {
      paketSelesai++;
      nilaiSelesai += val;
    }
  }

  // RUP Terealisasi (sesuai definisi CSV acuan: RUP Terumumkan Aktif yang memiliki paket transaksi)
  let nilaiRupTerealisasi = 0;
  const listKodeRupTerealisasi: string[] = [];

  for (const kdRup of uniqueRupWithTx) {
    listKodeRupTerealisasi.push(kdRup);
    const rDetail = rupLookupMap?.get(kdRup) || rupList.find(r => r.kd_rup === kdRup);
    if (rDetail) {
      nilaiRupTerealisasi += Number(rDetail.pagu) || 0;
    } else {
      const samplePkt = paketList.find(p => p.kode_rup === kdRup);
      nilaiRupTerealisasi += Number(samplePkt?.rup_pagu) || 0;
    }
  }

  // Total RUP Terumumkan keseluruhan yang dibebankan ke PPK
  const terumumkanRups = rupList.filter(r => r.is_terumumkan_aktif);
  const totalRupTerumumkanPaket = terumumkanRups.length;
  const totalRupTerumumkanNilai = terumumkanRups.reduce((sum, r) => sum + (Number(r.pagu) || 0), 0);

  // RUP Belum Terealisasi (terumumkan tapi belum ada transaksi di paketList terfilter)
  const belumJalanRups = terumumkanRups.filter(r => !uniqueRupWithTx.has(r.kd_rup));
  const rupBelumJalanPaket = belumJalanRups.length;
  const rupBelumJalanNilai = belumJalanRups.reduce((sum, r) => sum + (Number(r.pagu) || 0), 0);

  const totalNilaiRealisasi = nilaiKontrak + nilaiSelesai;
  const totalNilaiTransaksi = nilaiPemilihanBerlangsung + nilaiPemilihanSelesai + nilaiKontrak + nilaiSelesai;
  const persentaseSerapan = totalRupTerumumkanNilai > 0
    ? Math.round((totalNilaiRealisasi / totalRupTerumumkanNilai) * 1000) / 10
    : 0;

  const listKodePaketArr = Array.from(uniqueKodePaket);

  return {
    _schema_version: REKAP_PPK_SCHEMA_VERSION,

    // 17 Kolom Standar CSV Acuan
    nama: baseProfile.nama,
    role: 'PPK',
    nama_instansi: baseProfile.nama_instansi,
    nama_satuan_kerja: baseProfile.nama_satuan_kerja,
    nilai_rup: nilaiRupTerealisasi,
    paket_rup: listKodeRupTerealisasi.length,
    list_kode_rup: listKodeRupTerealisasi.join(', '),
    total_kode_paket: paketList.length,
    list_kode_paket: listKodePaketArr.join(', '),
    nilai_pemilihan_berlangsung: nilaiPemilihanBerlangsung,
    paket_pemilihan_berlangsung: paketPemilihanBerlangsung,
    nilai_pemilihan_selesai: nilaiPemilihanSelesai,
    paket_pemilihan_selesai: paketPemilihanSelesai,
    nilai_kontrak: nilaiKontrak,
    paket_kontrak: paketKontrak,
    nilai_selesai: nilaiSelesai,
    paket_selesai: paketSelesai,

    // Field Pengayaan (Extended)
    ppk_key: baseProfile.ppk_key,
    nip_nama_masked: baseProfile.nip_nama_masked,
    nip_asli: baseProfile.nip_asli || '',
    jabatan: baseProfile.jabatan || '',
    unit_kerja: baseProfile.unit_kerja || '',
    telepon: baseProfile.telepon || '',
    email: baseProfile.email || '',
    is_ppk_completed: Boolean(baseProfile.is_ppk_completed),
    total_rup_terumumkan_paket: totalRupTerumumkanPaket,
    total_rup_terumumkan_nilai: totalRupTerumumkanNilai,
    rup_belum_jalan_paket: rupBelumJalanPaket,
    rup_belum_jalan_nilai: rupBelumJalanNilai,
    total_nilai_realisasi: totalNilaiRealisasi,
    total_nilai_transaksi: totalNilaiTransaksi,
    persentase_serapan: persentaseSerapan,
    nilai_pdn: totalNilaiPdn,
    nilai_umk: totalNilaiUmk,
    kaji_ulang_count: rupList.reduce((sum, r) => sum + (r.kaji_ulang_count || 0), 0),
    penyedia_count: uniquePenyedia.size,
    breakdown_sumber: breakdownSumber,
    detail_rup_list: rupList,
    detail_paket_list: paketList
  };
};

const getSourcePathsForYear = (tahun: string): string[] => [
  path.resolve(dataDir, `dashboard/realisasi/table_${tahun}.json`),
  path.resolve(dataDir, `rup/paket-penyedia_${tahun}.json`),
  path.resolve(dataDir, `rup/paket-swakelola_${tahun}.json`),
  path.resolve(dataDir, `rup/history-kaji-ulang_${tahun}.json`),
  path.resolve(dataDir, `rup/master-satker_${tahun}.json`),
  path.resolve(dataDir, `ekatalog/paket-e-purchasing_${tahun}.json`),
  path.resolve(dataDir, `ekatalog-archive/paket-e-purchasing_${tahun}.json`),
  path.resolve(dataDir, `tender/non-tender-pengumuman_${tahun}.json`),
  path.resolve(dataDir, `tender/pencatatan-non-tender_${tahun}.json`),
  path.resolve(dataDir, `tender/pencatatan-non-tender-realisasi_${tahun}.json`),
  path.resolve(dataDir, `tender/pengumuman_${tahun}.json`),
  path.resolve(dataDir, `tender/pencatatan-swakelola_${tahun}.json`)
];

const getLatestSourceMtime = async (tahun: string): Promise<number> => {
  let latest = 0;
  const stats = await Promise.all(
    getSourcePathsForYear(tahun).map(async (p) => {
      try {
        const s = await fs.stat(p);
        return s.isFile() ? s.mtimeMs : 0;
      } catch {
        return 0;
      }
    })
  );
  for (const m of stats) {
    if (m > latest) latest = m;
  }
  return latest;
};

export const runRekapPpkMerge = async (
  tahun: string,
  trigger: string = 'manual',
  appendHistoryFn?: (entry: any) => Promise<void>
): Promise<any> => {
  const startTime = Date.now();

  try {
    const prereq = await checkRekapPpkPrerequisitesRaw(tahun);
    if (!prereq.allRequiredFound) {
      const missing = prereq.sources.filter(s => s.required && !s.found).map(s => s.label);
      const failResult = {
        id: `merge_rekap_ppk_${Date.now()}`,
        type: 'rekap-ppk',
        tahun,
        timestamp: new Date().toISOString(),
        trigger,
        duration_ms: Date.now() - startTime,
        status: 'failed',
        error: `Data wajib belum tersedia: ${missing.join(', ')}`,
        sources: {},
        result: {},
        anomalies: []
      };
      if (appendHistoryFn) await appendHistoryFn(failResult);
      return failResult;
    }

    // Load canonical realisasi table + detail raw sources
    const dashboardRealisasi = await readDataArraySafe(path.join(dataDir, 'dashboard', 'realisasi', `table_${tahun}.json`));
    const rupPenyedia = await readDataArraySafe(path.join(dataDir, 'rup', `paket-penyedia_${tahun}.json`));
    const rupSwakelola = await readDataArraySafe(path.join(dataDir, 'rup', `paket-swakelola_${tahun}.json`));
    const masterSatker = await readDataArraySafe(path.join(dataDir, 'rup', `master-satker_${tahun}.json`));
    const historyKajiUlang = await readDataArraySafe(path.join(dataDir, 'rup', `history-kaji-ulang_${tahun}.json`));

    const ekatalogV6 = await readDataArraySafe(path.join(dataDir, 'ekatalog', `paket-e-purchasing_${tahun}.json`));
    const ekatalogV5 = await readDataArraySafe(path.join(dataDir, 'ekatalog-archive', `paket-e-purchasing_${tahun}.json`));

    const nonTenderPengumuman = await readDataArraySafe(path.join(dataDir, 'tender', `non-tender-pengumuman_${tahun}.json`));
    const pctNonTender = await readDataArraySafe(path.join(dataDir, 'tender', `pencatatan-non-tender_${tahun}.json`));
    const pctNonTenderReal = await readDataArraySafe(path.join(dataDir, 'tender', `pencatatan-non-tender-realisasi_${tahun}.json`));
    const pengumumanTender = await readDataArraySafe(path.join(dataDir, 'tender', `pengumuman_${tahun}.json`));
    const pctSwakelola = await readDataArraySafe(path.join(dataDir, 'tender', `pencatatan-swakelola_${tahun}.json`));

    const ppkMaster = await loadPpkMaster();
    const penyediaMaster = await loadPenyediaMaster();

    // Build lookup maps
    const rupPenyediaMap = new Map<string, any>();
    for (const r of rupPenyedia) {
      if (r.kd_rup) rupPenyediaMap.set(String(r.kd_rup), r);
    }

    const rupSwakelolaMap = new Map<string, any>();
    for (const r of rupSwakelola) {
      if (r.kd_rup) rupSwakelolaMap.set(String(r.kd_rup), r);
    }

    const satkerMap = new Map<string, any>();
    for (const s of masterSatker) {
      if (s.kd_satker) satkerMap.set(String(s.kd_satker), s);
    }

    const kajiUlangCountMap = new Map<string, number>();
    for (const k of historyKajiUlang) {
      for (const key of [String(k.kd_rup_baru || ''), String(k.kd_rup_lama || '')].filter(Boolean)) {
        kajiUlangCountMap.set(key, (kajiUlangCountMap.get(key) || 0) + 1);
      }
    }

    // Index raw transactions for enrichment & unmasked E-Katalog nama_ppk lookup
    const ekV6Map = new Map<string, any>();
    const ekDisplayNameByNorm = new Map<string, string>();
    for (const item of ekatalogV6) {
      const id = String(item.order_id || '');
      if (id) ekV6Map.set(id, item);
      const rawNamaPpk = normalizeText(item.nama_ppk);
      if (rawNamaPpk) {
        const nk = normalizeNameKey(rawNamaPpk);
        if (nk && !ekDisplayNameByNorm.has(nk)) {
          ekDisplayNameByNorm.set(nk, rawNamaPpk);
        }
      }
    }

    const ekV5Map = new Map<string, any>();
    for (const item of ekatalogV5) {
      const id = String(item.kd_paket || item.no_paket || '');
      if (id) ekV5Map.set(id, item);
    }

    const pctNonTenderMap = new Map<string, any>();
    for (const item of pctNonTender) {
      const id = String(item.kd_nontender_pct || '');
      if (id) pctNonTenderMap.set(id, item);
    }

    const nonTenderMap = new Map<string, any>();
    for (const item of nonTenderPengumuman) {
      const id = String(item.kd_nontender || '');
      if (id) nonTenderMap.set(id, item);
    }

    const tenderMap = new Map<string, any>();
    for (const item of pengumumanTender) {
      const id = String(item.kd_tender || '');
      if (id) tenderMap.set(id, item);
    }

    const pctSwakelolaMap = new Map<string, any>();
    for (const item of pctSwakelola) {
      const id = String(item.kd_swakelola_pct || '');
      if (id) pctSwakelolaMap.set(id, item);
    }

    // Build PPK lookup maps (by masked string, lowercase masked, NIP, and normalized unmasked name)
    const ppkMap = new Map<string, any>();
    const ppkMapLower = new Map<string, any>();
    const ppkByNameKey = new Map<string, any>();
    const ppkEntryList: any[] = [];

    const registerPpkEntry = (maskedStr: string | null | undefined, entry: any) => {
      if (!entry || !entry.nama_lengkap) return;
      const nameKey = normalizeNameKey(entry.nama_lengkap);
      if (nameKey) {
        const existing = ppkByNameKey.get(nameKey);
        if (!existing || (!existing.jabatan && entry.jabatan) || (!existing.nip_asli && entry.nip_asli)) {
          const mergedEntry = {
            ...existing,
            ...entry,
            nip_asli: entry.nip_asli || existing?.nip_asli || '',
            jabatan: entry.jabatan || existing?.jabatan || '',
            unit_kerja: entry.unit_kerja || existing?.unit_kerja || '',
            telepon: entry.telepon || existing?.telepon || '',
            email: entry.email || existing?.email || '',
            nip_nama_masked: entry.nip_nama_masked || existing?.nip_nama_masked || ''
          };
          ppkByNameKey.set(nameKey, mergedEntry);
          if (!ppkEntryList.some(e => normalizeNameKey(e.nama_lengkap) === nameKey)) {
            ppkEntryList.push(mergedEntry);
          }
        }
      }
      if (maskedStr) {
        const norm = normalizeText(maskedStr);
        if (norm) {
          if (!ppkMap.has(norm) || (!ppkMap.get(norm)?.jabatan && entry.jabatan)) {
            ppkMap.set(norm, entry);
          }
          const lower = norm.toLowerCase();
          if (!ppkMapLower.has(lower) || (!ppkMapLower.get(lower)?.jabatan && entry.jabatan)) {
            ppkMapLower.set(lower, entry);
          }
        }
      }
      if (entry.nip_asli) {
        const nipNorm = normalizeText(entry.nip_asli);
        if (nipNorm && (!ppkMap.has(nipNorm) || (!ppkMap.get(nipNorm)?.jabatan && entry.jabatan))) {
          ppkMap.set(nipNorm, entry);
        }
      }
    };

    for (const p of ppkMaster) {
      registerPpkEntry(p.nip_nama_masked, p);
    }

    const penyediaMap = new Map<string, any>();
    for (const p of penyediaMaster) {
      if (p.kode_penyedia) penyediaMap.set(String(p.kode_penyedia), p);
      if (p.npwp) penyediaMap.set(String(p.npwp).replace(/[^a-zA-Z0-9]/g, ''), p);
    }

    // Fallback: Enrich PPK & Penyedia from existing merged datasets on disk (when MariaDB unavailable)
    const mergedFallbacks = [
      `rup-penyedia-enriched_${tahun}.json`,
      `rup-swakelola-enriched_${tahun}.json`,
      `epurchasing_enriched_${tahun}.json`,
      `nontender_enriched_${tahun}.json`,
      `pencatatan-nontender-enriched_${tahun}.json`
    ];
    for (const fname of mergedFallbacks) {
      const rows = await readDataArraySafe(path.join(mergedDir, fname));
      for (const row of rows) {
        if (row.ppk_nama_lengkap) {
          const entry = {
            nama_lengkap: row.ppk_nama_lengkap,
            nip_asli: row.ppk_nip_asli || '',
            jabatan: row.ppk_jabatan || '',
            unit_kerja: row.ppk_unit_kerja || '',
            telepon: row.ppk_telepon || '',
            email: row.ppk_email || '',
            nip_nama_masked: row.nip_nama_ppk || ''
          };
          const nipPart = normalizeText(row.nip_ppk || row.rup_nip_ppk);
          const namaPart = normalizeText(row.nama_ppk || row.rup_nama_ppk);
          const combinedMasked = nipPart && namaPart ? `${nipPart} - ${namaPart}` : (nipPart || namaPart);
          registerPpkEntry(row.nip_nama_ppk, entry);
          registerPpkEntry(combinedMasked, entry);
        }
        if (row.kode_penyedia && row.penyedia_nama) {
          if (!penyediaMap.has(String(row.kode_penyedia))) {
            penyediaMap.set(String(row.kode_penyedia), {
              kode_penyedia: row.kode_penyedia,
              npwp: row.penyedia_npwp || '',
              nama_penyedia: row.penyedia_nama,
              status_umkk: row.penyedia_status_umkk ?? null
            });
          }
          if (row.penyedia_npwp) {
            const cleanNpwp = String(row.penyedia_npwp).replace(/[^a-zA-Z0-9]/g, '');
            if (cleanNpwp && !penyediaMap.has(cleanNpwp)) {
              penyediaMap.set(cleanNpwp, {
                kode_penyedia: row.kode_penyedia,
                npwp: row.penyedia_npwp,
                nama_penyedia: row.penyedia_nama,
                status_umkk: row.penyedia_status_umkk ?? null
              });
            }
          }
        }
      }
    }

    // Register unmasked E-Katalog nama_ppk entries so masked matching still works without MariaDB/merged fallbacks
    for (const [nk, dispName] of ekDisplayNameByNorm.entries()) {
      if (!ppkByNameKey.has(nk)) {
        registerPpkEntry(null, {
          nama_lengkap: dispName,
          nip_asli: '',
          jabatan: '',
          unit_kerja: '',
          telepon: '',
          email: '',
          nip_nama_masked: ''
        });
      }
    }

    const pctNonTenderRealMap = new Map<string, any[]>();
    for (const r of pctNonTenderReal) {
      const k = String(r.kd_nontender_pct || '');
      if (k) {
        if (!pctNonTenderRealMap.has(k)) pctNonTenderRealMap.set(k, []);
        pctNonTenderRealMap.get(k)!.push(r);
      }
    }

    const defaultInstansi = rupPenyedia[0]?.nama_klpd?.toUpperCase() ||
      dashboardRealisasi[0]?.nama_instansi?.toUpperCase() ||
      'KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI';
    const defaultSatker = rupPenyedia[0]?.nama_satker ||
      'MENTERI NEGARA PENDAYAGUNAAN APARATUR NEGARA';

    const getSatkerName = (kdSatker: any, fallback?: string) => {
      const s = satkerMap.get(String(kdSatker || ''));
      if (s?.nama_satker) return s.nama_satker;
      // Clean trailing " - 427950" suffix from dashboard/realisasi if master satker doesn't use it
      const cleaned = normalizeText(fallback).replace(/\s*-\s*\d{4,}$/, '');
      return cleaned || defaultSatker;
    };

    const getPenyediaDetails = (kode?: string, npwp?: string, fallbackName: string = '-') => {
      const cleanNpwp = npwp ? String(npwp).replace(/[^a-zA-Z0-9]/g, '') : '';
      const p = (kode ? penyediaMap.get(String(kode)) : null) || (cleanNpwp ? penyediaMap.get(cleanNpwp) : null);
      return {
        nama_penyedia: fallbackName && fallbackName !== '-' ? fallbackName : (p?.nama_penyedia || '-'),
        status_umkk: p?.status_umkk ?? null
      };
    };

    const resolvePpk = (nip?: string, nama?: string, rawMasked?: string, isUnmaskedHint: boolean = false) => {
      const cleanNip = normalizeText(nip);
      const cleanNama = normalizeText(nama);
      const cleanRaw = normalizeText(rawMasked);
      const maskedKey = cleanNip && cleanNama ? `${cleanNip} - ${cleanNama}` : (cleanNip || cleanNama || cleanRaw);

      // 1. Direct lookup via exact unmasked name (for E-Katalog item.nama_ppk)
      let p: any = null;
      if (cleanNama && (isUnmaskedHint || !cleanNama.includes('*'))) {
        const nk = normalizeNameKey(cleanNama);
        if (nk) p = ppkByNameKey.get(nk) || null;
      }

      // 2. Lookup via masked key / NIP
      if (!p) {
        p =
          (cleanRaw && (ppkMap.get(cleanRaw) || ppkMapLower.get(cleanRaw.toLowerCase()))) ||
          (maskedKey && (ppkMap.get(maskedKey) || ppkMapLower.get(maskedKey.toLowerCase()))) ||
          (cleanNip && !cleanNip.includes('*') && ppkMap.get(cleanNip)) ||
          null;
      }

      // 3. Fallback: match masked name pattern against known canonical unmasked PPK names (from E-Katalog / Master)
      if (!p && cleanNama && cleanNama.includes('*')) {
        p = ppkEntryList.find(candidate => matchesMaskedName(cleanNama, candidate.nama_lengkap)) || null;
      }

      if (p && p.nama_lengkap) {
        const nk = normalizeNameKey(p.nama_lengkap);
        const enrichedMeta = (nk ? ppkByNameKey.get(nk) : null) || p;
        // Gunakan nama tampilan persis dari E-Katalog (acuan Excel) jika tersedia, else nama_lengkap
        const displayName = (cleanNama && (isUnmaskedHint || !cleanNama.includes('*')))
          ? cleanNama
          : (ekDisplayNameByNorm.get(nk) || enrichedMeta.nama_lengkap || p.nama_lengkap);
        const canonicalKey = enrichedMeta.nip_asli
          ? `NIP:${normalizeText(enrichedMeta.nip_asli)}`
          : `NAME:${nk}`;

        return {
          ppk_key: canonicalKey,
          nip_nama_masked: maskedKey || enrichedMeta.nip_nama_masked || '',
          nama: displayName,
          nip_asli: enrichedMeta.nip_asli || '',
          jabatan: enrichedMeta.jabatan || '',
          unit_kerja: enrichedMeta.unit_kerja || '',
          telepon: enrichedMeta.telepon || '',
          email: enrichedMeta.email || '',
          is_ppk_completed: Boolean(enrichedMeta.nip_asli || enrichedMeta.jabatan || ppkMaster.some(m => normalizeNameKey(m.nama_lengkap) === nk))
        };
      }

      if (cleanNama && !cleanNama.includes('*')) {
        const nk = normalizeNameKey(cleanNama);
        return {
          ppk_key: `NAME:${nk}`,
          nip_nama_masked: maskedKey,
          nama: cleanNama,
          nip_asli: '',
          jabatan: '',
          unit_kerja: '',
          telepon: '',
          email: '',
          is_ppk_completed: false
        };
      }

      if (maskedKey) {
        return {
          ppk_key: `MASKED:${maskedKey.toLowerCase()}`,
          nip_nama_masked: maskedKey,
          nama: cleanNama || cleanRaw || maskedKey,
          nip_asli: '',
          jabatan: '',
          unit_kerja: '',
          telepon: '',
          email: '',
          is_ppk_completed: false
        };
      }

      return {
        ppk_key: 'UNASSIGNED',
        nip_nama_masked: '-',
        nama: 'Belum Terpetakan (Tanpa PPK)',
        nip_asli: '',
        jabatan: '',
        unit_kerja: '',
        telepon: '',
        email: '',
        is_ppk_completed: false
      };
    };

    // Container per PPK
    const ppkGroups = new Map<string, {
      profile: any;
      rupMap: Map<string, PpkRupDetail>;
      pakets: PpkPacketDetail[];
    }>();

    const ensurePpkGroup = (resolved: ReturnType<typeof resolvePpk>, instansi?: string, satker?: string) => {
      if (!ppkGroups.has(resolved.ppk_key)) {
        ppkGroups.set(resolved.ppk_key, {
          profile: {
            ...resolved,
            nama_instansi: (instansi || defaultInstansi).toUpperCase(),
            nama_satuan_kerja: satker || defaultSatker
          },
          rupMap: new Map(),
          pakets: []
        });
      }
      return ppkGroups.get(resolved.ppk_key)!;
    };

    // 1. Index RUP Penyedia & RUP Swakelola per PPK (skip deleted/empty RUPs BEFORE creating any PPK group!)
    for (const r of rupPenyedia) {
      const kdRup = String(r.kd_rup || '');
      if (!kdRup || r.status_delete_rup === true) continue;
      if (!r.nip_ppk && !r.nama_ppk) continue;

      const resolved = resolvePpk(r.nip_ppk, r.nama_ppk);
      if (resolved.ppk_key === 'UNASSIGNED') continue;
      const group = ensurePpkGroup(resolved, r.nama_klpd, r.nama_satker);

      group.rupMap.set(kdRup, {
        kd_rup: kdRup,
        nama_paket: r.nama_paket || '-',
        tipe_paket: 'Penyedia',
        pagu: Number(r.pagu) || 0,
        jenis_pengadaan: r.jenis_pengadaan || '-',
        metode_pengadaan: r.metode_pengadaan || '-',
        status_umumkan_rup: r.status_umumkan_rup || '-',
        status_aktif_rup: Boolean(r.status_aktif_rup),
        status_delete_rup: Boolean(r.status_delete_rup),
        is_terumumkan_aktif: isRupTerumumkanAktif(r),
        status_pdn: r.status_pdn || '-',
        status_ukm: r.status_ukm || '-',
        kaji_ulang_count: kajiUlangCountMap.get(kdRup) || 0,
        transaksi_count: 0,
        transaksi_nilai: 0
      });
    }

    for (const r of rupSwakelola) {
      const kdRup = String(r.kd_rup || '');
      if (!kdRup || r.status_delete_rup === true) continue;
      if (!r.nip_ppk && !r.nama_ppk) continue;

      const resolved = resolvePpk(r.nip_ppk, r.nama_ppk);
      if (resolved.ppk_key === 'UNASSIGNED') continue;
      const group = ensurePpkGroup(resolved, r.nama_klpd, r.nama_satker);

      group.rupMap.set(kdRup, {
        kd_rup: kdRup,
        nama_paket: r.nama_paket || '-',
        tipe_paket: 'Swakelola',
        pagu: Number(r.pagu) || 0,
        jenis_pengadaan: r.tipe_swakelola_nama || 'Swakelola',
        metode_pengadaan: 'Swakelola',
        status_umumkan_rup: r.status_umumkan_rup || '-',
        status_aktif_rup: Boolean(r.status_aktif_rup),
        status_delete_rup: Boolean(r.status_delete_rup),
        is_terumumkan_aktif: isRupTerumumkanAktif(r),
        status_pdn: r.status_pdn || '-',
        status_ukm: '-',
        kaji_ulang_count: kajiUlangCountMap.get(kdRup) || 0,
        transaksi_count: 0,
        transaksi_nilai: 0
      });
    }

    // 2. Process EVERY package from canonical `dashboard/realisasi/table_{tahun}.json`
    for (const dt of dashboardRealisasi) {
      const kodePaket = String(dt.kode_paket || '');
      const kdRup = String(dt.kode_rup || '');
      const sumber = String(dt.sumber_transaksi || '');
      const rup = rupPenyediaMap.get(kdRup) || rupSwakelolaMap.get(kdRup) || null;

      let resolved: ReturnType<typeof resolvePpk>;
      let sortDateMs = 0;
      let satkerName = getSatkerName(rup?.kd_satker, dt.nama_satuan_kerja);
      let namaPenyedia = dt.nama_penyedia || '-';

      if (sumber === DEFAULT_ACUAN_SUMBER) {
        const ek = ekV6Map.get(kodePaket);
        if (ek?.nama_ppk) {
          // Acuan Excel: prioritaskan nama_ppk pelaksana langsung dari data E-Katalog
          resolved = resolvePpk(undefined, ek.nama_ppk, undefined, true);
        } else {
          resolved = resolvePpk(ek?.rup_nip_ppk || rup?.nip_ppk, ek?.rup_nama_ppk || rup?.nama_ppk);
        }
        if (ek?.order_date) {
          const ms = new Date(ek.order_date).getTime();
          if (!Number.isNaN(ms)) sortDateMs = ms;
        }
        if (ek) {
          satkerName = getSatkerName(ek.kode_satker, ek.nama_satker || satkerName);
          if (!namaPenyedia || namaPenyedia === '-') {
            namaPenyedia = getPenyediaDetails(ek.kode_penyedia, '', '').nama_penyedia;
          }
        }
      } else if (sumber === 'E-Katalog Versi 5.0') {
        const ek5 = ekV5Map.get(kodePaket);
        resolved = resolvePpk(ek5?.ppk_nip || rup?.nip_ppk, rup?.nama_ppk, ek5?.jabatan_ppk);
        if (ek5?.tanggal_buat_paket) {
          const ms = new Date(ek5.tanggal_buat_paket).getTime();
          if (!Number.isNaN(ms)) sortDateMs = ms;
        }
      } else if (sumber === 'Pencatatan Non Tender') {
        const tx = pctNonTenderMap.get(kodePaket);
        resolved = resolvePpk(tx?.nip_ppk || rup?.nip_ppk, tx?.nama_ppk || rup?.nama_ppk);
        if (tx?.tgl_buat_paket) {
          const ms = new Date(tx.tgl_buat_paket).getTime();
          if (!Number.isNaN(ms)) sortDateMs = ms;
        }
      } else if (sumber === 'Non Tender') {
        const tx = nonTenderMap.get(kodePaket);
        resolved = resolvePpk(tx?.nip_ppk || rup?.nip_ppk, tx?.nama_ppk || rup?.nama_ppk, tx?.nip_nama_ppk);
        if (tx?.tgl_buat_paket) {
          const ms = new Date(tx.tgl_buat_paket).getTime();
          if (!Number.isNaN(ms)) sortDateMs = ms;
        }
      } else if (sumber === 'Tender') {
        const tx = tenderMap.get(kodePaket);
        resolved = resolvePpk(tx?.nip_ppk || rup?.nip_ppk, tx?.nama_ppk || rup?.nama_ppk);
        if (tx?.tgl_buat_paket) {
          const ms = new Date(tx.tgl_buat_paket).getTime();
          if (!Number.isNaN(ms)) sortDateMs = ms;
        }
      } else if (sumber === 'Pencatatan Swakelola') {
        const tx = pctSwakelolaMap.get(kodePaket);
        resolved = resolvePpk(tx?.nip_ppk || rup?.nip_ppk, tx?.nama_ppk || rup?.nama_ppk);
        if (tx?.tgl_buat_paket) {
          const ms = new Date(tx.tgl_buat_paket).getTime();
          if (!Number.isNaN(ms)) sortDateMs = ms;
        }
        if (!namaPenyedia || namaPenyedia === '-') namaPenyedia = 'SWAKELOLA';
      } else {
        resolved = resolvePpk(rup?.nip_ppk, rup?.nama_ppk);
      }

      // Sesuai aturan RUP Acuan Excel: jika RUP ada di master RUP harus Terumumkan+Aktif,
      // jika RUP tidak lagi ada di master (terarsip/hilang) gunakan flag terumumkan=true dengan pagu dari tabel realisasi.
      const rupTerumumkan = rup ? isRupTerumumkanAktif(rup) : Boolean(kdRup);
      const rupPagu = rup ? (Number(rup.pagu) || Number(dt.nilai_pagu) || 0) : (Number(dt.nilai_pagu) || 0);
      const totalNilai = Number(dt.total_nilai) || 0;
      const nilaiPdn = Number(dt.nilai_pdn) || 0;
      const nilaiUmk = Number(dt.nilai_umk) || 0;

      const pkt: PpkPacketDetail = {
        kode_paket: kodePaket,
        kode_rup: kdRup,
        nama_paket: dt.nama_paket || rup?.nama_paket || '-',
        sumber_transaksi: sumber || '-',
        metode_pengadaan: dt.metode_pengadaan || rup?.metode_pengadaan || '-',
        jenis_pengadaan: dt.jenis_pengadaan || rup?.jenis_pengadaan || '-',
        sumber_dana: dt.sumber_dana || '-',
        nama_penyedia: namaPenyedia || '-',
        status_paket: dt.status_paket || '-',
        tahapan_pengadaan: dt.tahapan_pengadaan || '-',
        tahapan_rekap: mapTahapanRekapFromRealisasi(dt.tahapan_pengadaan, dt.status_paket),
        total_nilai: totalNilai,
        nilai_pdn: nilaiPdn,
        nilai_umk: nilaiUmk,
        rup_pagu: rupPagu,
        rup_terumumkan: rupTerumumkan,
        _sort_date: sortDateMs
      };

      const group = ensurePpkGroup(resolved, dt.nama_instansi || rup?.nama_klpd, satkerName);
      group.pakets.push(pkt);

      if (kdRup && group.rupMap.has(kdRup)) {
        const rDetail = group.rupMap.get(kdRup)!;
        rDetail.transaksi_count += 1;
        rDetail.transaksi_nilai += totalNilai;
      }
    }

    // Build final merged array per PPK (default top-level metrics = E-Katalog Acuan Standar, while storing all packets in detail_paket_list)
    const anomalies: string[] = [];
    let ppkCompletedCount = 0;
    let ppkIncompleteCount = 0;
    let totalPaketsAll = 0;
    let totalPaketsAcuan = 0;

    const mergedData = Array.from(ppkGroups.values()).map(g => {
      const rupList = Array.from(g.rupMap.values()).sort((a, b) => b.pagu - a.pagu);
      const allPaketsSorted = [...g.pakets].sort((a, b) => b._sort_date - a._sort_date);
      const acuanPaketsSorted = allPaketsSorted.filter(p => p.sumber_transaksi === DEFAULT_ACUAN_SUMBER);

      totalPaketsAll += allPaketsSorted.length;
      totalPaketsAcuan += acuanPaketsSorted.length;

      if (g.profile.is_ppk_completed) {
        ppkCompletedCount++;
      } else if (g.profile.ppk_key !== 'UNASSIGNED') {
        ppkIncompleteCount++;
        anomalies.push(`PPK "${g.profile.nama || g.profile.nip_nama_masked}" belum dilengkapi di Master PPK (${acuanPaketsSorted.length} paket acuan)`);
      } else {
        anomalies.push(`${allPaketsSorted.length} paket transaksi tidak memiliki atribut PPK di data sumber`);
      }

      const aggregated = aggregatePpkMetrics(g.profile, rupList, acuanPaketsSorted, g.rupMap);
      // Simpan seluruh paket (termasuk non-E-Katalog) untuk kebutuhan toggle/filter dinamis di API
      aggregated.detail_paket_list = allPaketsSorted;
      return aggregated;
    });

    // Sort descending by total_nilai_realisasi then total_rup_terumumkan_nilai
    mergedData.sort((a, b) =>
      (b.total_nilai_realisasi - a.total_nilai_realisasi) ||
      (b.total_rup_terumumkan_nilai - a.total_rup_terumumkan_nilai)
    );

    // Save to disk
    await fs.mkdir(mergedDir, { recursive: true });
    const outputPath = path.resolve(mergedDir, `rekap-ppk-enriched_${tahun}.json`);
    await fs.writeFile(outputPath, JSON.stringify(mergedData, null, 2), 'utf-8');

    rekapPpkCache[`rekap_ppk_enriched_${tahun}`] = mergedData;
    rekapPpkBuildMtime[`rekap_ppk_enriched_${tahun}`] = Date.now();

    const totalSourceRecords =
      dashboardRealisasi.length +
      rupPenyedia.length +
      rupSwakelola.length +
      ekatalogV6.length +
      ekatalogV5.length +
      nonTenderPengumuman.length +
      pctNonTender.length +
      pengumumanTender.length +
      pctSwakelola.length;

    const result = {
      id: `merge_rekap_ppk_${Date.now()}`,
      type: 'rekap-ppk',
      tahun,
      timestamp: new Date().toISOString(),
      trigger,
      duration_ms: Date.now() - startTime,
      status: ppkIncompleteCount > 0 ? 'partial' : 'success',
      records_input: totalSourceRecords,
      records_output: mergedData.length,
      ppk_matched: ppkCompletedCount,
      ppk_unmatched: ppkIncompleteCount,
      total_pakets: totalPaketsAcuan,
      total_pakets_all: totalPaketsAll,
      sources: {
        dashboard_realisasi: { found: dashboardRealisasi.length > 0, count: dashboardRealisasi.length },
        rup_penyedia: { found: rupPenyedia.length > 0, count: rupPenyedia.length },
        ekatalog_v6: { found: ekatalogV6.length > 0, count: ekatalogV6.length },
        non_tender: { found: nonTenderPengumuman.length > 0, count: nonTenderPengumuman.length },
        pencatatan_nontender: { found: pctNonTender.length > 0, count: pctNonTender.length },
        tender: { found: pengumumanTender.length > 0, count: pengumumanTender.length },
        ppk_master: { found: ppkMaster.length > 0, count: ppkMaster.length }
      },
      result: {
        total_records: mergedData.length,
        total_ppk: mergedData.length,
        ppk_completed: ppkCompletedCount,
        ppk_incomplete: ppkIncompleteCount,
        total_pakets: totalPaketsAcuan,
        total_pakets_all: totalPaketsAll
      },
      anomalies
    };

    if (appendHistoryFn) await appendHistoryFn(result);
    console.log(`[Merge Rekap PPK] Selesai: ${mergedData.length} PPK (${totalPaketsAcuan} paket acuan / ${totalPaketsAll} total realisasi) dalam ${result.duration_ms}ms (trigger: ${trigger})`);
    return result;
  } catch (error: any) {
    console.error('[Merge Rekap PPK] Error:', error);
    const failResult = {
      id: crypto.randomUUID(),
      type: 'rekap-ppk',
      tahun,
      timestamp: new Date().toISOString(),
      trigger,
      duration_ms: Date.now() - startTime,
      status: 'failed',
      error: error.message,
      anomalies: []
    };
    if (appendHistoryFn) await appendHistoryFn(failResult);
    return failResult;
  }
};

export const loadRekapPpkMergedData = async (
  tahun: string,
  appendHistoryFn?: (entry: any) => Promise<void>
): Promise<any[]> => {
  const cacheKey = `rekap_ppk_enriched_${tahun}`;
  const filePath = path.resolve(mergedDir, `rekap-ppk-enriched_${tahun}.json`);
  const latestSrcMtime = await getLatestSourceMtime(tahun);

  // Cek apakah RAM cache masih fresh terhadap file sumber terbaru (dari cron / manual sync)
  if (rekapPpkCache[cacheKey] && rekapPpkCache[cacheKey].length > 0) {
    const cachedAt = rekapPpkBuildMtime[cacheKey] || 0;
    if (latestSrcMtime <= cachedAt && rekapPpkCache[cacheKey][0]?._schema_version === REKAP_PPK_SCHEMA_VERSION) {
      return rekapPpkCache[cacheKey];
    }
  }

  let needsRegenerate = false;
  let diskMtime = 0;
  try {
    const outStat = await fs.stat(filePath);
    diskMtime = outStat.mtimeMs;
    if (latestSrcMtime > diskMtime) {
      needsRegenerate = true;
    }
  } catch {
    needsRegenerate = true;
  }

  if (!needsRegenerate) {
    const data = await readJsonRawSafe<any[]>(filePath);
    if (
      data &&
      Array.isArray(data) &&
      data.length > 0 &&
      data[0]?._schema_version === REKAP_PPK_SCHEMA_VERSION
    ) {
      rekapPpkCache[cacheKey] = data;
      rekapPpkBuildMtime[cacheKey] = diskMtime || Date.now();
      return data;
    }
  }

  // Auto-generate atau rebuild otomatis saat skema baru / data sumber diperbarui cron job
  await runRekapPpkMerge(tahun, 'auto_sync_refresh', appendHistoryFn);
  const generated = await readJsonRawSafe<any[]>(filePath);
  if (generated && Array.isArray(generated)) {
    rekapPpkCache[cacheKey] = generated;
    rekapPpkBuildMtime[cacheKey] = Date.now();
    return generated;
  }
  return [];
};
