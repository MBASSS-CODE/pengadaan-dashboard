import { getEndpointData } from '../../../utils/dataManager';

export default defineEventHandler(async (event) => {
  const group = getRouterParam(event, 'group');
  const endpoint = getRouterParam(event, 'endpoint');
  
  const query = getQuery(event);
  const tahun = query.tahun as string;
  
  if (!group || !endpoint) {
    throw createError({ statusCode: 400, statusMessage: 'Group or Endpoint missing' });
  }
  
  if (!tahun) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter tahun is required' });
  }

  // Pisahkan extra parameters selain tahun
  const extraParams = { ...query };
  delete extraParams.tahun;

  try {
    const data = await getEndpointData(group, endpoint, tahun, extraParams);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal Server Error' });
  }
});
