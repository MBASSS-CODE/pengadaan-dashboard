import path from 'path';
import fs from 'fs/promises';
import { getRealisasiMasterData } from '../../utils/realisasiMasterMerge';

export const readJsonSafe = async (filePath: string): Promise<any[]> => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = (query.tahun as string) || new Date().getFullYear().toString();

  try {
    const unifiedData = await getRealisasiMasterData(tahun);
    
    if (!unifiedData || unifiedData.length === 0) {
        return { 
          success: true, 
          summary: {
            totalPesanan: 0, totalNilai: 0, totalPdn: 0, totalUmk: 0,
            trend: [], sumberTransaksi: [], metodePengadaan: [], jenisPengadaan: [],
            sumberDana: [], topPpk: [], topPenyedia: []
          } 
        };
    }

    let totalPesanan = 0;
    let totalNilai = 0;
    let totalPdn = 0;
    let totalUmk = 0;

    const trendMap = new Map();
    const sumberTransaksiMap = new Map();
    const metodeMap = new Map();
    const jenisMap = new Map();
    const sumberDanaMap = new Map();
    const ppkMap = new Map();
    const penyediaMap = new Map();

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    monthNames.forEach(m => trendMap.set(m, 0));

    unifiedData.forEach(item => {
      totalPesanan++;
      const valNilai = Number(item.total_nilai) || 0;
      const valPdn = Number(item.nilai_pdn) || 0;
      const valUmk = Number(item.nilai_umk) || 0;

      totalNilai += valNilai;
      totalPdn += valPdn;
      totalUmk += valUmk;

      if (item._sort_date) {
        const d = new Date(item._sort_date);
        if (!isNaN(d.getTime())) {
          const m = d.getMonth();
          const monthName = monthNames[m];
          trendMap.set(monthName, (trendMap.get(monthName) || 0) + valNilai);
        }
      }

      const addGroup = (mapObj: Map<string, number>, key: string | undefined, val: number) => {
        const k = key || 'Tidak Diketahui';
        mapObj.set(k, (mapObj.get(k) || 0) + val);
      };

      addGroup(sumberTransaksiMap, item.sumber_transaksi, valNilai);
      addGroup(metodeMap, item.metode_pengadaan, valNilai);
      addGroup(jenisMap, item.jenis_pengadaan, valNilai);
      addGroup(sumberDanaMap, item.sumber_dana, valNilai);
      
      // Publik view doesn't show PPK normally, but if the frontend expects it we can send dummy or just send it if it exists. Let's provide it.
      if (item.nama_ppk && item.nama_ppk !== '-') {
        addGroup(ppkMap, item.nama_ppk, valNilai);
      }
      if (item.nama_penyedia && item.nama_penyedia !== '-') {
        addGroup(penyediaMap, item.nama_penyedia, valNilai);
      }
    });

    const formatResult = (mapObj: Map<string, number>) => {
      return Array.from(mapObj.entries()).map(([label, total]) => ({ label, total }));
    };

    const sortResult = (arr: {label: string, total: number}[]) => {
      return arr.sort((a, b) => b.total - a.total);
    };

    return {
      success: true,
      summary: {
        totalPesanan,
        totalNilai,
        totalPdn,
        totalUmk,
        trend: formatResult(trendMap),
        sumberTransaksi: sortResult(formatResult(sumberTransaksiMap)),
        metodePengadaan: sortResult(formatResult(metodeMap)),
        jenisPengadaan: sortResult(formatResult(jenisMap)),
        sumberDana: sortResult(formatResult(sumberDanaMap)),
        topPpk: sortResult(formatResult(ppkMap)).slice(0, 10),
        topPenyedia: sortResult(formatResult(penyediaMap)).slice(0, 10)
      }
    };
  } catch (error: any) {
    console.error('API analytics realisasi error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan'
    };
  }
});
