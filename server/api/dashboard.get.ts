import { getDashboardPrecomputed } from '../utils/dataManager';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const tahun = query.tahun as string;
  const instansi = (query.instansi as string) || config.apiDataKodeKlpd || 'K22';
  const jenis = (query.jenis as string) || config.apiDataJenis || '1';
  const view = query.view as string;
  const eselon = query.eselon as string;
  const satker = query.satker as string;

  if (!tahun) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter tahun is required' });
  }

  try {
    const data = await getDashboardPrecomputed(tahun, instansi, jenis, view, eselon, satker);
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' });
  }
});
