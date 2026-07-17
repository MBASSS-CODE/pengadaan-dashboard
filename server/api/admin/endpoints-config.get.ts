import { endpointRegistry, getActiveEndpoints } from '../../utils/cronManager';

export default defineEventHandler(async (event) => {
  try {
    const activeEndpoints = getActiveEndpoints();

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
