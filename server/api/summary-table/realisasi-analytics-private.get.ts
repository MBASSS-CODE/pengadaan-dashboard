import path from 'path';
import fs from 'fs/promises';

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
    const dir = path.resolve(process.cwd(), 'server', 'data', 'merged');
    const unifiedData = await readJsonSafe(path.join(dir, `realisasi_master_${tahun}.json`));
    
    if (!unifiedData || unifiedData.length === 0) {
        return { success: true, trend: [], byMetode: [], bySumberDana: [] };
    }

    // Trend bulanan
    const months = Array.from({ length: 12 }, (_, i) => i);
    const trendMap = new Map();
    
    months.forEach(m => {
      trendMap.set(m, { month: m, total_paket: 0, total_nilai: 0, nilai_pdn: 0, nilai_umk: 0 });
    });

    // Agregasi Metode dan Sumber Dana
    const metodeMap = new Map();
    const sumberDanaMap = new Map();

    unifiedData.forEach(item => {
      // Bulanan
      if (item._sort_date) {
        const d = new Date(item._sort_date);
        if (!isNaN(d.getTime())) {
          const m = d.getMonth();
          if (trendMap.has(m)) {
            const tm = trendMap.get(m);
            tm.total_paket += 1;
            tm.total_nilai += (Number(item.total_nilai) || 0);
            tm.nilai_pdn += (Number(item.nilai_pdn) || 0);
            tm.nilai_umk += (Number(item.nilai_umk) || 0);
          }
        }
      }

      // Metode Pengadaan
      const metode = item.metode_pengadaan || 'Tidak Diketahui';
      if (!metodeMap.has(metode)) {
        metodeMap.set(metode, { label: metode, count: 0, total_nilai: 0 });
      }
      const mm = metodeMap.get(metode);
      mm.count += 1;
      mm.total_nilai += (Number(item.total_nilai) || 0);

      // Sumber Dana
      const sumber = item.sumber_dana || 'Tidak Diketahui';
      if (!sumberDanaMap.has(sumber)) {
        sumberDanaMap.set(sumber, { label: sumber, count: 0, total_nilai: 0 });
      }
      const sm = sumberDanaMap.get(sumber);
      sm.count += 1;
      sm.total_nilai += (Number(item.total_nilai) || 0);
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const trendResult = Array.from(trendMap.values()).map(t => ({
      ...t,
      month_name: monthNames[t.month]
    }));

    return {
      success: true,
      trend: trendResult,
      byMetode: Array.from(metodeMap.values()).sort((a, b) => b.total_nilai - a.total_nilai),
      bySumberDana: Array.from(sumberDanaMap.values()).sort((a, b) => b.total_nilai - a.total_nilai)
    };
  } catch (error: any) {
    console.error('API analytics realisasi error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan'
    };
  }
});
