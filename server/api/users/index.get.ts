import { getUsers, User } from '../../utils/userManager';
import { isAdminOrDeveloper, isDeveloper } from '../../../shared/utils/roles';

export default defineEventHandler(async (event) => {
  const actorRole = event.context.user?.role as string | undefined;
  if (!isAdminOrDeveloper(actorRole)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Anda tidak memiliki akses' });
  }

  const users = await getUsers();
  // Sembunyikan akun developer jika yang login bukan developer (Opsi A)
  const visibleUsers = isDeveloper(actorRole)
    ? users
    : users.filter((u: User) => u.role !== 'developer');

  const safeUsers = visibleUsers.map((u: User) => ({
    id: u.id,
    username: u.username,
    role: u.role
  }));

  return { success: true, data: safeUsers };
});
