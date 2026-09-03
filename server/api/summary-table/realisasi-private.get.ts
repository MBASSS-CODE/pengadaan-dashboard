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

    filteredData.sort((a, b) => (b._sort_date || 0) - (a._sort_date || 0));

    const sumberSet = new Set<string>();
    const metodeSet = new Set<string>();
    
    let totalNilai = 0;
    let totalPdn = 0;
    let totalUmk = 0;

    for (const item of filteredData) {
      if (item.sumber_transaksi) sumberSet.add(item.sumber_transaksi);
      if (item.metode_pengadaan && item.metode_pengadaan !== '-') metodeSet.add(item.metode_pengadaan);
      
      totalNilai += Number(item.total_nilai) || 0;
      totalPdn += Number(item.nilai_pdn) || 0;
      totalUmk += Number(item.nilai_umk) || 0;
    }

    const filterOptions = {
      sumberTransaksi: Array.from(sumberSet).sort(),
      metodePengadaan: Array.from(metodeSet).sort()
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
