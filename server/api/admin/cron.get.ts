import { getCronConfig, getEndpointLogs } from '../../utils/cronManager';

export default defineEventHandler(async (event) => {
  try {
    const config = await getCronConfig();
    const logs = await getEndpointLogs();
    
    return {
      success: true,
      data: {
        config,
        logs
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
});
