import { loadPpkMaster } from './ppkManager';
import {
  extractLast3Digits,
  normalizeNameKey,
  normalizeText,
  type ResolvedPpkIdentity
} from './ppkMatcher';

/**
 * Resolve identitas kanonik PPK dari ppk_master.id.
 * Mengembalikan null apabila ppkMasterId tidak valid atau tidak ditemukan (fail-closed).
 */
export const resolvePpkIdentity = async (
  ppkMasterId: number | null | undefined
): Promise<ResolvedPpkIdentity | null> => {
  if (!ppkMasterId || !Number.isFinite(Number(ppkMasterId))) {
    return null;
  }

  const ppkMaster = await loadPpkMaster();
  const targetId = Number(ppkMasterId);
  const target = ppkMaster.find((p: any) => Number(p.id) === targetId);

  if (!target || !target.nama_lengkap) {
    return null;
  }

  const targetNip = normalizeText(target.nip_asli).toLowerCase();
  const targetNameKey = normalizeNameKey(target.nama_lengkap);

  // Kumpulkan semua entri ppk_master yang merujuk ke orang yang sama
  const relatedEntries = ppkMaster.filter((p: any) => {
    if (Number(p.id) === targetId) return true;
    const pNip = normalizeText(p.nip_asli).toLowerCase();
    const pName = normalizeNameKey(p.nama_lengkap);
    if (targetNip && pNip && targetNip === pNip) return true;
    if (targetNameKey && pName && targetNameKey === pName) return true;
    return false;
  });

  const nipAsliSet = new Set<string>();
  const nipSuffixes = new Set<string>();
  const normalizedNames = new Set<string>();
  const maskedKeys = new Set<string>();

  for (const entry of relatedEntries) {
    const nip = normalizeText(entry.nip_asli);
    if (nip) {
      nipAsliSet.add(nip.toLowerCase());
      const suffix = extractLast3Digits(nip);
      if (suffix) nipSuffixes.add(suffix);
    }
    const nk = normalizeNameKey(entry.nama_lengkap);
    if (nk) normalizedNames.add(nk);
    const masked = normalizeText(entry.nip_nama_masked).toLowerCase();
    if (masked) maskedKeys.add(masked);
  }

  const allMasterNames = [
    ...new Set(ppkMaster.map((p: any) => normalizeText(p.nama_lengkap)).filter(Boolean))
  ];

  return {
    ppkMasterId: targetId,
    namaLengkap: normalizeText(target.nama_lengkap),
    nipAsli: normalizeText(target.nip_asli),
    jabatan: normalizeText(target.jabatan),
    unitKerja: normalizeText(target.unit_kerja),
    telepon: normalizeText(target.telepon),
    email: normalizeText(target.email),
    nipAsliSet,
    nipSuffixes,
    normalizedNames,
    maskedKeys,
    allMasterNames
  };
};
