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
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 50;

  try {
    const unifiedData = await getRealisasiMasterData(tahun);

    if (!unifiedData || unifiedData.length === 0) {
      return {
        success: true,
        data: [],
        meta: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          totalNilai: 0,
          totalPdn: 0,
          totalUmk: 0
        },
        filterOptions: {
          sumberTransaksi: [],
          metodePengadaan: []
        }
      };
    }

    let filteredData = [...unifiedData];

    if (query.filterType === 'tanggal' && query.startDate && query.endDate) {
      const start = new Date(query.startDate as string);
      start.setHours(0, 0, 0, 0);
      const startMs = start.getTime();
      
      const end = new Date(query.endDate as string);
      end.setHours(23, 59, 59, 999);
      const endMs = end.getTime();

      filteredData = filteredData.filter(item => {
        if (!item._sort_date) return false;
        return item._sort_date >= startMs && item._sort_date <= endMs;
      });
    } else if (query.filterType === 'triwulan' && query.selectedQuarter) {
      const q = query.selectedQuarter as string;
      const quarterMap: Record<string, number[]> = {
        'TW 1': [0, 1, 2],
        'TW 2': [3, 4, 5],
        'TW 3': [6, 7, 8],
        'TW 4': [9, 10, 11]
      };
      const validMonths = quarterMap[q] || [];
      if (validMonths.length > 0) {
        filteredData = filteredData.filter(item => {
          if (!item._sort_date) return false;
          const d = new Date(item._sort_date);
          return validMonths.includes(d.getMonth());
        });
      }
    }

    if (query.search) {
      const search = (query.search as string).toLowerCase();
      filteredData = filteredData.filter(item => 
        (item.nama_paket && item.nama_paket.toLowerCase().includes(search)) ||
        (item.nama_penyedia && item.nama_penyedia.toLowerCase().includes(search)) ||
        (item.kode_rup && String(item.kode_rup).includes(search)) ||
        (item.kode_paket && String(item.kode_paket).includes(search))
      );
    }
    
    if (query.sumberTransaksi) {
      const sources = (query.sumberTransaksi as string).split(',');
      filteredData = filteredData.filter(item => sources.includes(item.sumber_transaksi));
    }

    if (query.metodePengadaan) {
      const metode = (query.metodePengadaan as string).split(',');
      filteredData = filteredData.filter(item => metode.includes(item.metode_pengadaan));
    }

    if (query.ppk) {
      const vals = (query.ppk as string).split(',');
      filteredData = filteredData.filter(item => vals.includes(item.nama_ppk));
    }

    if (query.penyedia) {
      const vals = (query.penyedia as string).split(',');
      filteredData = filteredData.filter(item => vals.includes(item.nama_penyedia));
    }

    if (query.sumberDana) {
      const vals = (query.sumberDana as string).split(',');
      filteredData = filteredData.filter(item => vals.includes(item.sumber_dana));
    }

    if (query.jenisPengadaan) {
      const vals = (query.jenisPengadaan as string).split(',');
      filteredData = filteredData.filter(item => vals.includes(item.jenis_pengadaan));
    }

    if (query.statusPaket) {
      const vals = (query.statusPaket as string).split(',');
      filteredData = filteredData.filter(item => vals.includes(item.status_paket));
    }

    if (query.tahapanPengadaan) {
      const vals = (query.tahapanPengadaan as string).split(',');
      filteredData = filteredData.filter(item => vals.includes(item.tahapan_pengadaan));
    }

    filteredData.sort((a, b) => (b._sort_date || 0) - (a._sort_date || 0));

    const sumberSet = new Set<string>();
    const metodeSet = new Set<string>();
    const ppkSet = new Set<string>();
    const penyediaSet = new Set<string>();
    const sumberDanaSet = new Set<string>();
    const jenisPengadaanSet = new Set<string>();
    const statusPaketSet = new Set<string>();
    const tahapanPengadaanSet = new Set<string>();
    
    let totalNilai = 0;
    let totalPdn = 0;
    let totalUmk = 0;

    for (const item of filteredData) {
      if (item.sumber_transaksi) sumberSet.add(item.sumber_transaksi);
      if (item.metode_pengadaan && item.metode_pengadaan !== '-') metodeSet.add(item.metode_pengadaan);
      if (item.nama_ppk && item.nama_ppk !== '-') ppkSet.add(item.nama_ppk);
      if (item.nama_penyedia && item.nama_penyedia !== '-') penyediaSet.add(item.nama_penyedia);
      if (item.sumber_dana && item.sumber_dana !== '-') sumberDanaSet.add(item.sumber_dana);
      if (item.jenis_pengadaan && item.jenis_pengadaan !== '-') jenisPengadaanSet.add(item.jenis_pengadaan);
      if (item.status_paket && item.status_paket !== '-') statusPaketSet.add(item.status_paket);
      if (item.tahapan_pengadaan && item.tahapan_pengadaan !== '-') tahapanPengadaanSet.add(item.tahapan_pengadaan);
      
      totalNilai += Number(item.total_nilai) || 0;
      totalPdn += Number(item.nilai_pdn) || 0;
      totalUmk += Number(item.nilai_umk) || 0;
    }

    const filterOptions = {
      sumberTransaksi: Array.from(sumberSet).sort(),
      metodePengadaan: Array.from(metodeSet).sort(),
      ppk: Array.from(ppkSet).sort(),
      penyedia: Array.from(penyediaSet).sort(),
      sumberDana: Array.from(sumberDanaSet).sort(),
      jenisPengadaan: Array.from(jenisPengadaanSet).sort(),
      statusPaket: Array.from(statusPaketSet).sort(),
      tahapanPengadaan: Array.from(tahapanPengadaanSet).sort()
    };

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    let paginatedData = filteredData;
    if (limit < 100000) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedData = filteredData.slice(startIndex, endIndex);
    }

    return {
      success: true,
      data: paginatedData,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        totalNilai,
        totalPdn,
        totalUmk
      },
      filterOptions
    };
  } catch (error: any) {
    console.error('API realisasi private error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan'
    };
  }
});
