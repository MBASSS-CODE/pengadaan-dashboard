import { getDashboardPrecomputed } from '../utils/dataManager';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tahun = query.tahun as string;
  const instansi = query.instansi as string;

  if (!tahun || !instansi) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter tahun dan instansi are required' });
  }

  try {
    const data = await getDashboardPrecomputed(tahun, instansi);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' });
  }
});
