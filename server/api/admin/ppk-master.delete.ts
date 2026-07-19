import { loadPpkMaster, savePpkMaster } from '../../utils/ppkManager';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.nip_nama_masked) {
    throw createError({ statusCode: 400, statusMessage: 'nip_nama_masked is required' });
  }

  try {
    const ppkList = await loadPpkMaster();
    const filtered = ppkList.filter((p: any) => p.nip_nama_masked !== body.nip_nama_masked);

    if (filtered.length === ppkList.length) {
      return { success: false, message: 'Data PPK tidak ditemukan' };
    }

    await savePpkMaster(filtered);

    return {
      success: true,
      message: 'Data PPK berhasil dihapus'
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
