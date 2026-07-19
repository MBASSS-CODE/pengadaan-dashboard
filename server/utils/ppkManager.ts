import fs from 'fs/promises';
import path from 'path';

const ppkPath = path.resolve(process.cwd(), 'server/data/ppk_master.json');

// In-memory cache for PPK data
let ppkCache: any[] | null = null;

/**
 * Load PPK master data from file (or memory cache)
 */
export const loadPpkMaster = async (): Promise<any[]> => {
  if (ppkCache) return ppkCache;
  try {
    const data = await fs.readFile(ppkPath, 'utf-8');
    ppkCache = JSON.parse(data);
    return ppkCache!;
  } catch (e) {
    ppkCache = [];
    return [];
  }
};

/**
 * Save PPK master data to file + update RAM cache
 */
export const savePpkMaster = async (data: any[]): Promise<void> => {
  const dir = path.dirname(ppkPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(ppkPath, JSON.stringify(data, null, 2), 'utf-8');
  ppkCache = data;
};

/**
 * Get unique PPK identifiers from non-tender data
 */
export const extractUniquePpk = async (tahun: string): Promise<string[]> => {
  const filePath = path.resolve(process.cwd(), `server/data/tender/non-tender-pengumuman_${tahun}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const data: any[] = JSON.parse(raw);
    const uniquePpk = [...new Set(data.map((d: any) => d.nip_nama_ppk).filter(Boolean))];
    return uniquePpk;
  } catch {
    return [];
  }
};

/**
 * Invalidate RAM cache (called when file changes externally)
 */
export const invalidatePpkCache = () => {
  ppkCache = null;
};
