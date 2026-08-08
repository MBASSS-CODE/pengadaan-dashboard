import { processPenyediaQueue, loadPenyediaMaster } from '../../utils/penyediaManager';

export default defineEventHandler(async (event) => {
  try {
    // Run the background job manually and wait for it
    await processPenyediaQueue();
    
    // Optionally return the updated statistics
    const listPenyedia = await loadPenyediaMaster();
    
    const totalFromApi = listPenyedia.length;
    const totalCompleted = listPenyedia.filter(p => p.status_api === 'SUCCESS').length;
    const totalIncomplete = totalFromApi - totalCompleted;

    return {
      success: true,
      message: 'Berhasil memproses antrean penyedia.',
      meta: {
        totalFromApi,
        totalCompleted,
        totalIncomplete
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
