import { getSystemStats } from '../../utils/dataManager';

export default defineEventHandler(async (event) => {
  try {
    const stats = await getSystemStats();
    return {
      success: true,
      data: stats
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
});
