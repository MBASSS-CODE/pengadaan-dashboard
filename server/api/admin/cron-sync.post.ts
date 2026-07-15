import { triggerSyncAll } from '../../utils/cronManager';

export default defineEventHandler(async (event) => {
  try {
    await triggerSyncAll();
    
    return {
      success: true,
      message: 'Proses sinkronisasi telah dijalankan di latar belakang.'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
});
