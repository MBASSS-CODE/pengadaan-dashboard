import { loadPpkMaster, upsertPpkMaster } from '../../utils/ppkManager';
import { triggerAutoMerge } from '../../utils/mergeManager';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.nip_nama_masked) {
    throw createError({ statusCode: 400, statusMessage: 'nip_nama_masked is required' });
  }

  if (!body.nama_lengkap || !body.nama_lengkap.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'nama_lengkap is required' });
  }

  try {
    const ppkList = await loadPpkMaster();
    const now = new Date().toISOString();

    const existingPpk = ppkList.find((p: any) => p.nip_nama_masked === body.nip_nama_masked);

    const ppkData: Record<string, any> = {
      nip_nama_masked: body.nip_nama_masked,
      nama_lengkap: body.nama_lengkap.trim(),
      nip_asli: body.nip_asli?.trim() || '',
      jabatan: body.jabatan?.trim() || '',
      unit_kerja: body.unit_kerja?.trim() || '',
      telepon: body.telepon?.trim() || '',
      email: body.email?.trim() || '',
      updated_at: now
    };

    if (existingPpk) {
      // Update existing
      ppkData.created_at = existingPpk.created_at || now;
    } else {
      // New entry
      ppkData.created_at = now;
    }

    await upsertPpkMaster(ppkData);

    // Trigger auto-merge after PPK update
    const tahun = new Date().getFullYear().toString();
    triggerAutoMerge(tahun, 'auto_ppk_update');

    return {
      success: true,
      message: existingPpk ? 'Data PPK berhasil diperbarui' : 'Data PPK berhasil ditambahkan',
      data: ppkData
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
