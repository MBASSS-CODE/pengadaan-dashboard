import { saveEndpointsConfig, endpointRegistry } from '../../utils/cronManager';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    if (!body || !body.activeEndpoints) {
      throw new Error('activeEndpoints wajib diisi');
    }

    const config: Record<string, string[]> = body.activeEndpoints;

    // Validasi: pastikan semua endpoint yang dikirim ada di registry
    for (const [group, endpoints] of Object.entries(config)) {
      const registryGroup = endpointRegistry[group];
      if (!registryGroup) {
        throw new Error(`Grup "${group}" tidak ditemukan di registry`);
      }
      const validEndpoints = registryGroup.map(r => r.endpoint);
      for (const ep of endpoints) {
        if (!validEndpoints.includes(ep)) {
          throw new Error(`Endpoint "${ep}" tidak valid untuk grup "${group}"`);
        }
      }
    }

    await saveEndpointsConfig(config);
    
    return {
      success: true,
      message: 'Konfigurasi endpoint berhasil disimpan',
      data: config
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
});
