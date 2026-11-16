import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { loadPpkMaster } from './ppkManager';
import { loadPenyediaMaster } from './penyediaManager';

const dataDir = path.resolve(process.cwd(), 'server/data');
const mergedDir = path.resolve(dataDir, 'merged');

let rekapPpkCache: Record<string, any[]> = {};
const autoRefreshedYears = new Set<string>();

export const invalidateRekapPpkCache = () => {
  rekapPpkCache = {};
  autoRefreshedYears.clear();
};

const readJsonSafe = async (filePath: string): Promise<any[] | null> => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const normalizeText = (val?: string | null): string => {
  if (!val) return '';
  return String(val).replace(/\s+/g, ' ').trim();
};

const isRupTerumumkanAktif = (r: any): boolean => {
  if (!r) return false;
  return (
    r.status_umumkan_rup === 'Terumumkan' &&
    r.status_aktif_rup === true &&
    r.status_delete_rup !== true
  );
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
        const parsed: any = await readJsonSafe(filePath);
        if (Array.isArray(parsed)) count = parsed.length;
        else if (parsed?.data && Array.isArray(parsed.data)) count = parsed.data.length;
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
 * Used both during merge generation and during dynamic runtime filtering (e.g. by sumberTransaksi or tanggal).
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

    // Load all raw files
    const rupPenyedia: any[] = (await readJsonSafe(path.join(dataDir, 'rup', `paket-penyedia_${tahun}.json`))) || [];
    const rupSwakelola: any[] = (await readJsonSafe(path.join(dataDir, 'rup', `paket-swakelola_${tahun}.json`))) || [];
    const masterSatker: any[] = (await readJsonSafe(path.join(dataDir, 'rup', `master-satker_${tahun}.json`))) || [];
    const historyKajiUlang: any[] = (await readJsonSafe(path.join(dataDir, 'rup', `history-kaji-ulang_${tahun}.json`))) || [];

    const ekatalogV6: any[] = (await readJsonSafe(path.join(dataDir, 'ekatalog', `paket-e-purchasing_${tahun}.json`))) || [];
    const ekatalogV5Raw: any = await readJsonSafe(path.join(dataDir, 'ekatalog-archive', `paket-e-purchasing_${tahun}.json`));
    const ekatalogV5: any[] = Array.isArray(ekatalogV5Raw) ? ekatalogV5Raw : (ekatalogV5Raw?.data || []);

    const nonTenderPengumuman: any[] = (await readJsonSafe(path.join(dataDir, 'tender', `non-tender-pengumuman_${tahun}.json`))) || [];
    const pctNonTender: any[] = (await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-non-tender_${tahun}.json`))) || [];
    const pctNonTenderReal: any[] = (await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-non-tender-realisasi_${tahun}.json`))) || [];
    const pengumumanTender: any[] = (await readJsonSafe(path.join(dataDir, 'tender', `pengumuman_${tahun}.json`))) || [];
    const pctSwakelola: any[] = (await readJsonSafe(path.join(dataDir, 'tender', `pencatatan-swakelola_${tahun}.json`))) || [];

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

    const ppkMap = new Map<string, any>();
    const ppkMapLower = new Map<string, any>();
    const registerPpkEntry = (maskedStr: string | null | undefined, entry: any) => {
      if (!entry || !entry.nama_lengkap) return;
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

    // Fallback: Enrich PPK & Penyedia from existing merged datasets on disk (when MariaDB unavailable/empty)
    const packetRealisasiFallbackMap = new Map<string, any>();
    const rupPpkFallbackByCode = new Map<string, string>();
    const mergedFallbacks = [
      `rup-penyedia-enriched_${tahun}.json`,
      `rup-swakelola-enriched_${tahun}.json`,
      `epurchasing_enriched_${tahun}.json`,
      `nontender_enriched_${tahun}.json`,
      `pencatatan-nontender-enriched_${tahun}.json`
    ];
    for (const fname of mergedFallbacks) {
      const rows = (await readJsonSafe(path.join(mergedDir, fname))) || [];
      if (!Array.isArray(rows)) continue;
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
          if (row.kd_rup) rupPpkFallbackByCode.set(String(row.kd_rup), row.ppk_nama_lengkap);
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

    const realisasiMasterRows = (await readJsonSafe(path.join(mergedDir, `realisasi_master_${tahun}.json`))) || [];
    if (Array.isArray(realisasiMasterRows)) {
      for (const rm of realisasiMasterRows) {
        if (rm.kode_paket) packetRealisasiFallbackMap.set(String(rm.kode_paket), rm);
        if (rm.kode_rup && rm.nama_ppk && rm.nama_ppk !== '-') {
          rupPpkFallbackByCode.set(String(rm.kode_rup), rm.nama_ppk);
        }
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

    const defaultInstansi = rupPenyedia[0]?.nama_klpd?.toUpperCase() || 'KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI';
    const defaultSatker = rupPenyedia[0]?.nama_satker || 'MENTERI NEGARA PENDAYAGUNAAN APARATUR NEGARA';

    const getSatkerName = (kdSatker: any, fallback?: string) => {
      const s = satkerMap.get(String(kdSatker || ''));
      return s?.nama_satker || fallback || defaultSatker;
    };

    const getPenyediaDetails = (kode?: string, npwp?: string, fallbackName: string = '-') => {
      const cleanNpwp = npwp ? String(npwp).replace(/[^a-zA-Z0-9]/g, '') : '';
      const p = (kode ? penyediaMap.get(String(kode)) : null) || (cleanNpwp ? penyediaMap.get(cleanNpwp) : null);
      return {
        nama_penyedia: p?.nama_penyedia || fallbackName || '-',
        status_umkk: p?.status_umkk ?? null
      };
    };

    const resolvePpk = (nip?: string, nama?: string, rawMasked?: string) => {
      const cleanNip = normalizeText(nip);
      const cleanNama = normalizeText(nama);
      const cleanRaw = normalizeText(rawMasked);
      const maskedKey = cleanNip && cleanNama ? `${cleanNip} - ${cleanNama}` : (cleanNip || cleanNama || cleanRaw);

      const p =
        (cleanRaw && (ppkMap.get(cleanRaw) || ppkMapLower.get(cleanRaw.toLowerCase()))) ||
        (maskedKey && (ppkMap.get(maskedKey) || ppkMapLower.get(maskedKey.toLowerCase()))) ||
        (cleanNip && ppkMap.get(cleanNip));

      if (p && p.nama_lengkap) {
        const canonicalKey = p.nip_asli ? `NIP:${normalizeText(p.nip_asli)}` : `NAME:${normalizeText(p.nama_lengkap).toLowerCase()}`;
        return {
          ppk_key: canonicalKey,
          nip_nama_masked: maskedKey || p.nip_nama_masked,
          nama: p.nama_lengkap,
          nip_asli: p.nip_asli || '',
          jabatan: p.jabatan || '',
          unit_kerja: p.unit_kerja || '',
          telepon: p.telepon || '',
          email: p.email || '',
          is_ppk_completed: true
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

    // 1. Index RUP Penyedia & RUP Swakelola per PPK
    for (const r of rupPenyedia) {
      const resolved = resolvePpk(r.nip_ppk, r.nama_ppk);
      const group = ensurePpkGroup(resolved, r.nama_klpd, r.nama_satker);
      const kdRup = String(r.kd_rup || '');
      if (!kdRup || r.status_delete_rup === true) continue;

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
      const resolved = resolvePpk(r.nip_ppk, r.nama_ppk);
      const group = ensurePpkGroup(resolved, r.nama_klpd, r.nama_satker);
      const kdRup = String(r.kd_rup || '');
      if (!kdRup || r.status_delete_rup === true) continue;

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

    const addPacketToPpk = (resolved: ReturnType<typeof resolvePpk>, instansi: string | undefined, satker: string | undefined, pkt: PpkPacketDetail) => {
      const group = ensurePpkGroup(resolved, instansi, satker);
      group.pakets.push(pkt);
      if (pkt.kode_rup && group.rupMap.has(pkt.kode_rup)) {
        const rDetail = group.rupMap.get(pkt.kode_rup)!;
        rDetail.transaksi_count += 1;
        rDetail.transaksi_nilai += pkt.total_nilai;
      }
    };

    // 2. Process E-Katalog V6
    const ekatIgnoredStatuses = new Set(['CANCELLED', 'CANCELLED_ON_NEGOTIATION', 'CANCELLED_ON_REVIEW', 'DRAFT']);
    for (const item of ekatalogV6) {
      if (ekatIgnoredStatuses.has(item.status)) continue;

      const kdRup = String(item.rup_code || '');
      const rup = rupPenyediaMap.get(kdRup) || {};
      const rmFallback = packetRealisasiFallbackMap.get(String(item.order_id || ''));
      const resolved = resolvePpk(item.rup_nip_ppk || rup.nip_ppk, item.rup_nama_ppk || rup.nama_ppk);
      const penyedia = getPenyediaDetails(item.kode_penyedia, '', rmFallback?.nama_penyedia || '');

      const nilai = Number(item.total) || 0;
      const isPdn = String(item.flag_minikom).toLowerCase() === 'ya' || String(item.flag_minikom).toLowerCase() === 'true';
      const isUmk = Boolean(
        (penyedia.status_umkk && penyedia.status_umkk !== 'Non-UMKM' && penyedia.status_umkk !== 'Tidak Diketahui') ||
        (rmFallback && Number(rmFallback.nilai_umk) > 0)
      );

      let tahapanRekap: PpkPacketDetail['tahapan_rekap'] = 'kontrak';
      let tahapanPengadaan = 'Kontrak';
      if (item.status === 'WAITING_SELLER_CONFIRMATION') {
        tahapanRekap = 'pemilihan_berlangsung';
        tahapanPengadaan = 'Pemilihan Berlangsung';
      } else if (
        item.status === 'COMPLETED' ||
        item.status === 'PAYMENT_OUTSIDE_SYSTEM' ||
        (item.status === 'ON_PROCESS' && item.shipment_status === 'COMPLETED')
      ) {
        tahapanRekap = 'selesai';
        tahapanPengadaan = 'Serah Terima / Selesai';
      }

      addPacketToPpk(resolved, rup.nama_klpd, getSatkerName(item.kode_satker, item.nama_satker), {
        kode_paket: String(item.order_id || ''),
        kode_rup: kdRup,
        nama_paket: rup.nama_paket || item.rup_name || '-',
        sumber_transaksi: 'E-Katalog Versi 6.0',
        metode_pengadaan: rup.metode_pengadaan || 'E-Purchasing',
        jenis_pengadaan: rup.jenis_pengadaan || '-',
        sumber_dana: item.funding_source || '-',
        nama_penyedia: penyedia.nama_penyedia || '-',
        status_paket: item.status || '-',
        tahapan_pengadaan: tahapanPengadaan,
        tahapan_rekap: tahapanRekap,
        total_nilai: nilai,
        nilai_pdn: isPdn ? nilai : 0,
        nilai_umk: isUmk ? nilai : 0,
        rup_pagu: Number(rup.pagu) || 0,
        rup_terumumkan: isRupTerumumkanAktif(rup),
        _sort_date: item.order_date ? new Date(item.order_date).getTime() : 0
      });
    }

    // 3. Process E-Katalog Archive V5
    for (const item of ekatalogV5) {
      const statusStr = String(item.paket_status_str || item.status_paket || '').toLowerCase();
      if (statusStr.includes('batal')) continue;

      const kdRup = String(item.kd_rup || '');
      const rup = rupPenyediaMap.get(kdRup) || {};
      const resolved = resolvePpk(item.ppk_nip || rup.nip_ppk, rup.nama_ppk, item.jabatan_ppk);
      const penyedia = getPenyediaDetails(item.kd_penyedia, '', '');
      const nilai = Number(item.total_harga) || 0;
      const isUmk = Boolean(penyedia.status_umkk && penyedia.status_umkk !== 'Non-UMKM' && penyedia.status_umkk !== 'Tidak Diketahui');
      const isSelesai = item.paket_status_str === 'Paket Selesai' || item.status_paket === 'selesai' || statusStr.includes('selesai');

      addPacketToPpk(resolved, rup.nama_klpd, getSatkerName(item.satker_id, item.nama_satker), {
        kode_paket: String(item.kd_paket || item.no_paket || ''),
        kode_rup: kdRup,
        nama_paket: item.nama_paket || rup.nama_paket || '-',
        sumber_transaksi: 'E-Katalog Versi 5.0',
        metode_pengadaan: rup.metode_pengadaan || 'E-Purchasing',
        jenis_pengadaan: rup.jenis_pengadaan || '-',
        sumber_dana: item.nama_sumber_dana || '-',
        nama_penyedia: penyedia.nama_penyedia || '-',
        status_paket: isSelesai ? 'COMPLETED' : 'ON PROCESS',
        tahapan_pengadaan: isSelesai ? 'Serah Terima' : 'Kontrak',
        tahapan_rekap: isSelesai ? 'selesai' : 'kontrak',
        total_nilai: nilai,
        nilai_pdn: nilai,
        nilai_umk: isUmk ? nilai : 0,
        rup_pagu: Number(rup.pagu) || 0,
        rup_terumumkan: isRupTerumumkanAktif(rup),
        _sort_date: item.tanggal_buat_paket ? new Date(item.tanggal_buat_paket).getTime() : 0
      });
    }

    // 4. Process Pencatatan Non-Tender
    for (const item of pctNonTender) {
      const statusPaket = String(item.status_nontender_pct_ket || item.status_nontender_pct || '-').toUpperCase();
      if (statusPaket.includes('BATAL')) continue;

      const kdRup = String(item.kd_rup || '');
      const rup = rupPenyediaMap.get(kdRup) || {};
      const resolved = resolvePpk(item.nip_ppk || rup.nip_ppk, item.nama_ppk || rup.nama_ppk);
      const reals = pctNonTenderRealMap.get(String(item.kd_nontender_pct)) || [];

      let namaPenyedia = '-';
      let isUmk = Boolean(item.nilai_umk_pct > 0 || rup.status_ukm === 'UKM' || rup.status_ukm === 'Ya');
      if (reals.length > 0) {
        const real = reals[0];
        const p = getPenyediaDetails('', real.npwp_penyedia, real.nama_penyedia);
        namaPenyedia = p.nama_penyedia || real.nama_penyedia || '-';
        if (p.status_umkk && p.status_umkk !== 'Non-UMKM') isUmk = true;
      }

      const realisasiNilai = Number(item.total_realisasi) || 0;
      const nilai = realisasiNilai || Number(item.pagu) || 0;
      const isPdn = Boolean(item.nilai_pdn_pct > 0 || rup.status_pdn === 'PDN' || rup.status_pdn === 'Ya');
      const isSelesai = statusPaket.includes('SELESAI');

      addPacketToPpk(resolved, item.nama_klpd, getSatkerName(item.kd_satker, item.nama_satker), {
        kode_paket: String(item.kd_nontender_pct || ''),
        kode_rup: kdRup,
        nama_paket: item.nama_paket || '-',
        sumber_transaksi: 'Pencatatan Non Tender',
        metode_pengadaan: item.mtd_pemilihan || '-',
        jenis_pengadaan: item.kategori_pengadaan || rup.jenis_pengadaan || '-',
        sumber_dana: item.sumber_dana || '-',
        nama_penyedia: namaPenyedia,
        status_paket: statusPaket,
        tahapan_pengadaan: statusPaket,
        tahapan_rekap: isSelesai ? 'selesai' : 'kontrak',
        total_nilai: nilai,
        nilai_pdn: isPdn ? nilai : 0,
        nilai_umk: isUmk ? nilai : 0,
        rup_pagu: Number(rup.pagu) || 0,
        rup_terumumkan: isRupTerumumkanAktif(rup),
        _sort_date: item.tgl_buat_paket ? new Date(item.tgl_buat_paket).getTime() : 0
      });
    }

    // 5. Process Non-Tender Pengumuman
    for (const item of nonTenderPengumuman) {
      const statusLower = String(item.status_nontender || '').toLowerCase();
      if (statusLower.includes('batal') || statusLower.includes('gagal')) continue;

      const kdRup = String(item.kd_rup || '');
      const rup = rupPenyediaMap.get(kdRup) || {};
      const resolved = resolvePpk(item.nip_ppk || rup.nip_ppk, item.nama_ppk || rup.nama_ppk, item.nip_nama_ppk);
      const nilai = Number(item.pagu) || Number(item.anggaran_total) || Number(item.hps) || 0;
      const isPdn = rup.status_pdn === 'PDN' || rup.status_pdn === 'Ya';
      const isUmk = rup.status_ukm === 'UKM' || rup.status_ukm === 'Ya';

      let tahapanRekap: PpkPacketDetail['tahapan_rekap'] = 'pemilihan_berlangsung';
      if (item.status_nontender === 'Selesai') tahapanRekap = 'selesai';
      else if (statusLower.includes('kontrak')) tahapanRekap = 'kontrak';

      addPacketToPpk(resolved, item.nama_klpd, getSatkerName(item.kd_satker, item.nama_satker), {
        kode_paket: String(item.kd_nontender || ''),
        kode_rup: kdRup,
        nama_paket: item.nama_paket || '-',
        sumber_transaksi: 'Non Tender',
        metode_pengadaan: item.mtd_pemilihan || '-',
        jenis_pengadaan: item.jenis_pengadaan || rup.jenis_pengadaan || '-',
        sumber_dana: item.sumber_dana || '-',
        nama_penyedia: item.nama_penyedia || item.pemenang || '-',
        status_paket: String(item.status_nontender || 'BERLANGSUNG').toUpperCase(),
        tahapan_pengadaan: String(item.status_nontender || 'Pemilihan').toUpperCase(),
        tahapan_rekap: tahapanRekap,
        total_nilai: nilai,
        nilai_pdn: isPdn ? nilai : 0,
        nilai_umk: isUmk ? nilai : 0,
        rup_pagu: Number(rup.pagu) || 0,
        rup_terumumkan: isRupTerumumkanAktif(rup),
        _sort_date: item.tgl_buat_paket ? new Date(item.tgl_buat_paket).getTime() : 0
      });
    }

    // 6. Process Pengumuman Tender
    for (const item of pengumumanTender) {
      const statusLower = String(item.status_tender || '').toLowerCase();
      if (statusLower.includes('batal') || statusLower.includes('gagal')) continue;

      const kdRup = String(item.kd_rup || '');
      const rup = rupPenyediaMap.get(kdRup) || {};
      const resolved = resolvePpk(item.nip_ppk || rup.nip_ppk, item.nama_ppk || rup.nama_ppk);
      const nilai = Number(item.pagu) || Number(item.hps) || 0;
      const isPdn = rup.status_pdn === 'PDN' || rup.status_pdn === 'Ya';
      const isUmk = rup.status_ukm === 'UKM' || rup.status_ukm === 'Ya';

      let tahapanRekap: PpkPacketDetail['tahapan_rekap'] = 'pemilihan_berlangsung';
      if (item.status_tender === 'Selesai') tahapanRekap = 'selesai';
      else if (statusLower.includes('kontrak')) tahapanRekap = 'kontrak';

      addPacketToPpk(resolved, item.nama_klpd, getSatkerName(item.kd_satker, item.nama_satker), {
        kode_paket: String(item.kd_tender || ''),
        kode_rup: kdRup,
        nama_paket: item.nama_paket || '-',
        sumber_transaksi: 'Tender',
        metode_pengadaan: item.mtd_pemilihan || 'Tender',
        jenis_pengadaan: item.jenis_pengadaan || rup.jenis_pengadaan || '-',
        sumber_dana: item.sumber_dana || '-',
        nama_penyedia: '-',
        status_paket: String(item.status_tender || 'BERLANGSUNG').toUpperCase(),
        tahapan_pengadaan: String(item.status_tender || 'Pemilihan').toUpperCase(),
        tahapan_rekap: tahapanRekap,
        total_nilai: nilai,
        nilai_pdn: isPdn ? nilai : 0,
        nilai_umk: isUmk ? nilai : 0,
        rup_pagu: Number(rup.pagu) || 0,
        rup_terumumkan: isRupTerumumkanAktif(rup),
        _sort_date: item.tgl_buat_paket ? new Date(item.tgl_buat_paket).getTime() : 0
      });
    }

    // 7. Process Pencatatan Swakelola
    for (const item of pctSwakelola) {
      const statusPaket = String(item.status_swakelola_pct_ket || item.status_swakelola_pct || '-').toUpperCase();
      if (statusPaket.includes('BATAL')) continue;

      const kdRup = String(item.kd_rup || '');
      const rup = rupSwakelolaMap.get(kdRup) || {};
      const resolved = resolvePpk(item.nip_ppk || rup.nip_ppk, item.nama_ppk || rup.nama_ppk);
      const realisasiNilai = Number(item.total_realisasi) || 0;
      const nilai = realisasiNilai || Number(item.pagu) || 0;
      const isPdn = Boolean(item.nilai_pdn_pct > 0 || rup.status_pdn === 'PDN' || rup.status_pdn === 'Ya');
      const isSelesai = statusPaket.includes('SELESAI');

      addPacketToPpk(resolved, item.nama_klpd, getSatkerName(item.kd_satker, item.nama_satker), {
        kode_paket: String(item.kd_swakelola_pct || ''),
        kode_rup: kdRup,
        nama_paket: item.nama_paket || '-',
        sumber_transaksi: 'Pencatatan Swakelola',
        metode_pengadaan: 'Swakelola',
        jenis_pengadaan: item.tipe_swakelola_nama || item.tipe_swakelola || 'Swakelola',
        sumber_dana: item.sumber_dana || '-',
        nama_penyedia: 'SWAKELOLA',
        status_paket: statusPaket,
        tahapan_pengadaan: statusPaket,
        tahapan_rekap: isSelesai ? 'selesai' : 'kontrak',
        total_nilai: nilai,
        nilai_pdn: isPdn ? nilai : 0,
        nilai_umk: 0,
        rup_pagu: Number(rup.pagu) || 0,
        rup_terumumkan: isRupTerumumkanAktif(rup),
        _sort_date: item.tgl_buat_paket ? new Date(item.tgl_buat_paket).getTime() : 0
      });
    }

    // Build final merged array per PPK
    const anomalies: string[] = [];
    let ppkCompletedCount = 0;
    let ppkIncompleteCount = 0;
    let totalPakets = 0;

    const mergedData = Array.from(ppkGroups.values()).map(g => {
      const rupList = Array.from(g.rupMap.values()).sort((a, b) => b.pagu - a.pagu);
      const paketsSorted = g.pakets.sort((a, b) => b._sort_date - a._sort_date);
      totalPakets += paketsSorted.length;

      if (g.profile.is_ppk_completed) {
        ppkCompletedCount++;
      } else if (g.profile.ppk_key !== 'UNASSIGNED') {
        ppkIncompleteCount++;
        anomalies.push(`PPK "${g.profile.nip_nama_masked}" belum dilengkapi di Master PPK (${paketsSorted.length} paket, ${rupList.length} RUP)`);
      } else {
        anomalies.push(`${paketsSorted.length} paket transaksi tidak memiliki atribut PPK di data sumber`);
      }

      return aggregatePpkMetrics(g.profile, rupList, paketsSorted, g.rupMap);
    });

    // Sort descending by total_nilai_transaksi then total_rup_terumumkan_nilai
    mergedData.sort((a, b) =>
      (b.total_nilai_transaksi - a.total_nilai_transaksi) ||
      (b.total_rup_terumumkan_nilai - a.total_rup_terumumkan_nilai)
    );

    // Save to disk
    await fs.mkdir(mergedDir, { recursive: true });
    const outputPath = path.resolve(mergedDir, `rekap-ppk-enriched_${tahun}.json`);
    await fs.writeFile(outputPath, JSON.stringify(mergedData, null, 2), 'utf-8');

    rekapPpkCache[`rekap_ppk_enriched_${tahun}`] = mergedData;

    const totalSourceRecords =
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
      total_pakets: totalPakets,
      sources: {
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
        total_pakets: totalPakets
      },
      anomalies
    };

    if (appendHistoryFn) await appendHistoryFn(result);
    console.log(`[Merge Rekap PPK] Selesai: ${mergedData.length} PPK (${totalPakets} paket) dalam ${result.duration_ms}ms (trigger: ${trigger})`);
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
  if (rekapPpkCache[cacheKey]) return rekapPpkCache[cacheKey];

  const filePath = path.resolve(mergedDir, `rekap-ppk-enriched_${tahun}.json`);
  const data = await readJsonSafe(filePath);
  if (data && Array.isArray(data) && data.length > 0) {
    // Auto-refresh once per session if disk file has masked PPKs despite enriched/master data potentially resolving them
    const hasUnresolvedMaskedPpk = data.some((d: any) => d.ppk_key !== 'UNASSIGNED' && !d.is_ppk_completed);
    if (hasUnresolvedMaskedPpk && !autoRefreshedYears.has(tahun)) {
      autoRefreshedYears.add(tahun);
      await runRekapPpkMerge(tahun, 'auto_ppk_refresh', appendHistoryFn);
      const refreshed = await readJsonSafe(filePath);
      if (refreshed && Array.isArray(refreshed) && refreshed.length > 0) {
        rekapPpkCache[cacheKey] = refreshed;
        return refreshed;
      }
    }
    rekapPpkCache[cacheKey] = data;
    return data;
  }

  // Auto-generate if missing
  await runRekapPpkMerge(tahun, 'auto', appendHistoryFn);
  const generated = await readJsonSafe(filePath);
  if (generated && Array.isArray(generated)) {
    rekapPpkCache[cacheKey] = generated;
    return generated;
  }
  return [];
};
