import { endpointRegistry, loadEndpointsConfig } from '../../utils/cronManager';

export default defineEventHandler(async (event) => {
  try {
    const activeEndpoints = await loadEndpointsConfig();

    return {
      success: true,
      data: {
        registry: endpointRegistry,
        activeEndpoints
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
});
