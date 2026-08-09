import { executeEPurchasingMerge } from '~/server/utils/mergeManager';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const tahun = body.tahun || new Date().getFullYear().toString();

  try {
    const result = await executeEPurchasingMerge(tahun, 'manual');
    
    if (result.status === 'success') {
      return {
        success: true,
        message: 'Data E-Purchasing berhasil diintegrasikan',
        data: result
      };
    } else {
      return {
        success: false,
        message: (result as any).error || 'Gagal mengintegrasikan data E-Purchasing',
        data: result
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan sistem saat merge E-Purchasing'
    };
  }
});
