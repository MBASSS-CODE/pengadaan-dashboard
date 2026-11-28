import { getUsers, User } from '../../utils/userManager';
import { loadPpkMaster } from '../../utils/ppkManager';
import { isAdminOrDeveloper, isDeveloper } from '../../../shared/utils/roles';

export default defineEventHandler(async (event) => {
  const actorRole = event.context.user?.role as string | undefined;
  if (!isAdminOrDeveloper(actorRole)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Anda tidak memiliki akses' });
  }

  const [users, ppkList] = await Promise.all([
    getUsers(),
    loadPpkMaster().catch(() => [])
  ]);

  const ppkById = new Map<number, any>();
  for (const p of ppkList) {
    if (p.id !== undefined && p.id !== null) {
      ppkById.set(Number(p.id), p);
    }
  }

  // Sembunyikan akun developer jika yang login bukan developer (Opsi A)
  const visibleUsers = isDeveloper(actorRole)
    ? users
    : users.filter((u: User) => u.role !== 'developer');

  const safeUsers = visibleUsers.map((u: User) => {
    const ppk = u.ppk_master_id ? ppkById.get(Number(u.ppk_master_id)) : null;
    return {
      id: u.id,
      username: u.username,
      role: u.role,
      must_change_password: Boolean(u.must_change_password),
      ppk_master_id: u.ppk_master_id ? Number(u.ppk_master_id) : null,
      ppk_nama_lengkap: ppk?.nama_lengkap || null,
      ppk_nip_asli: ppk?.nip_asli || null
    };
  });

  return { success: true, data: safeUsers };
});
