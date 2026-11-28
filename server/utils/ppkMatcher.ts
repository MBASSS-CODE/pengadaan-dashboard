export const normalizeText = (val?: string | null): string => {
  if (!val) return '';
  return String(val).replace(/\s+/g, ' ').trim();
};

export const stripAcademicTitle = (name?: string | null): string => {
  if (!name) return '';
  // Hapus gelar di belakang koma, misal "Nisa Nurrela, A.Md." -> "Nisa Nurrela"
  return normalizeText(String(name).split(',')[0]);
};

export const normalizeNameKey = (name?: string | null): string => {
  return stripAcademicTitle(name).toLowerCase();
};

export const matchesMaskedName = (maskedName?: string | null, fullName?: string | null): boolean => {
  const mWords = normalizeText(maskedName).toLowerCase().split(' ').filter(Boolean);
  const fWords = normalizeNameKey(fullName).split(' ').filter(Boolean);
  if (mWords.length === 0 || mWords.length !== fWords.length) return false;
  return mWords.every((mw, idx) => mw.length === fWords[idx].length && mw[0] === fWords[idx][0]);
};

export interface ResolvedPpkIdentity {
  ppkMasterId: number;
  namaLengkap: string;
  nipAsli: string;
  jabatan: string;
  unitKerja: string;
  telepon: string;
  email: string;
  nipAsliSet: Set<string>;
  nipSuffixes: Set<string>;
  normalizedNames: Set<string>;
  maskedKeys: Set<string>;
  allMasterNames: string[];
}

export const extractLast3Digits = (val?: string | null): string => {
  const digits = normalizeText(val).replace(/\D/g, '');
  return digits.length >= 3 ? digits.slice(-3) : '';
};

export const isNumericNip = (val?: string | null): boolean => {
  return /^\d{8,}$/.test(normalizeText(val));
};

interface PpkFieldCandidates {
  nipUnmasked?: Array<string | null | undefined>;
  maskedKeys?: Array<string | null | undefined>;
  names?: Array<string | null | undefined>;
  nipMasked?: string | null | undefined;
  nameMasked?: string | null | undefined;
}

const matchesPpkCandidates = (
  identity: ResolvedPpkIdentity,
  c: PpkFieldCandidates
): boolean => {
  // 1. Cek NIP asli (unmasked) terlebih dahulu. Jika ada NIP eksplisit milik orang lain, langsung tolak.
  for (const rawNip of c.nipUnmasked || []) {
    const nip = normalizeText(rawNip);
    if (!nip || nip.includes('*')) continue;
    const nipLower = nip.toLowerCase();
    if (identity.nipAsliSet.has(nipLower)) return true;
    // Jika row memiliki NIP numerik valid yang berbeda dari NIP PPK ini, pastikan tidak bocor ke PPK ini
    if (isNumericNip(nip)) return false;
  }

  // 2. Cek kecocokan nama unmasked (mengabaikan gelar akademik & non-breaking space)
  let sawUnmaskedName = false;
  for (const rawName of c.names || []) {
    const clean = normalizeText(rawName);
    if (!clean || clean === '-' || clean.includes('*')) continue;
    sawUnmaskedName = true;
    const nk = normalizeNameKey(clean);
    if (nk && identity.normalizedNames.has(nk)) {
      return true;
    }
  }
  // Jika tersedia nama unmasked yang jelas dan bukan milik PPK ini, tolak
  if (sawUnmaskedName) {
    return false;
  }

  // 3. Cek string nip_nama_masked persis
  for (const rawMasked of c.maskedKeys || []) {
    const m = normalizeText(rawMasked).toLowerCase();
    if (m && identity.maskedKeys.has(m)) {
      return true;
    }
  }

  // 4. Cek nama masked (misal "n*** n******") HANYA jika unik terhadap seluruh master PPK
  const maskedName = normalizeText(c.nameMasked);
  if (maskedName && maskedName.includes('*')) {
    const nipSuffix = extractLast3Digits(c.nipMasked);
    if (nipSuffix && identity.nipSuffixes.size > 0 && !identity.nipSuffixes.has(nipSuffix)) {
      return false;
    }

    const matchingMasterNames = identity.allMasterNames.filter((full) =>
      matchesMaskedName(maskedName, full)
    );
    const uniqueNormMatches = new Set(matchingMasterNames.map((n) => normalizeNameKey(n)));
    if (
      uniqueNormMatches.size === 1 &&
      identity.normalizedNames.has([...uniqueNormMatches][0]!)
    ) {
      return true;
    }
  }

  return false;
};

export const matchesRekapPpkRow = (identity: ResolvedPpkIdentity, row: any): boolean => {
  if (!row || row.ppk_key === 'UNASSIGNED') return false;

  const ppkKey = normalizeText(row.ppk_key);
  const keyNip = ppkKey.startsWith('NIP:') ? ppkKey.slice(4) : '';
  const keyName = ppkKey.startsWith('NAME:') ? ppkKey.slice(5) : '';

  return matchesPpkCandidates(identity, {
    nipUnmasked: [row.nip_asli, keyNip],
    maskedKeys: [row.nip_nama_masked],
    names: [row.nama, keyName],
    nipMasked: row.nip_nama_masked,
    nameMasked: row.nama
  });
};

export const matchesRealisasiRow = (identity: ResolvedPpkIdentity, row: any): boolean => {
  if (!row) return false;

  return matchesPpkCandidates(identity, {
    nipUnmasked: [row.ppk_nip_asli],
    maskedKeys: [row.ppk_nip_masked],
    names: [row.nama_ppk],
    nipMasked: row.ppk_nip_masked,
    nameMasked: row.nama_ppk
  });
};

export const matchesRupRow = (identity: ResolvedPpkIdentity, row: any): boolean => {
  if (!row) return false;

  const combinedMasked =
    row.nip_ppk && row.nama_ppk ? `${normalizeText(row.nip_ppk)} - ${normalizeText(row.nama_ppk)}` : '';

  return matchesPpkCandidates(identity, {
    nipUnmasked: [row.ppk_nip_asli, row.nip_ppk],
    maskedKeys: [combinedMasked, row.nip_nama_ppk],
    names: [row.ppk_nama_lengkap, row.nama_ppk],
    nipMasked: row.nip_ppk,
    nameMasked: row.nama_ppk
  });
};
