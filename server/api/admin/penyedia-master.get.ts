import { loadPenyediaMaster } from '../../utils/penyediaManager';

export default defineEventHandler(async (event) => {
  try {
    const listPenyedia = await loadPenyediaMaster();

    const mappedList = listPenyedia.map(item => {
      return {
        ...item,
        is_completed: item.status_api === 'SUCCESS',
        is_in_db: true
      };
    });

    const totalFromApi = mappedList.length;
    const totalCompleted = mappedList.filter(p => p.status_api === 'SUCCESS').length;
    const totalIncomplete = totalFromApi - totalCompleted;

    return {
      success: true,
      data: mappedList,
      meta: {
        totalFromApi,
        totalCompleted,
        totalIncomplete,
        missingYears: []
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
