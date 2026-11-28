import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { findUserByUsername, createUser } from '../../utils/userManager';
import { loadPpkMaster } from '../../utils/ppkManager';
import { isAdminOrDeveloper, isDeveloper, isPpk, isValidRole } from '../../../shared/utils/roles';

export default defineEventHandler(async (event) => {
  const actorRole = event.context.user?.role as string | undefined;
  if (!isAdminOrDeveloper(actorRole)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Anda tidak memiliki akses' });
  }

  const body = await readBody(event);
  const { username, password, role, ppk_master_id, must_change_password } = body || {};

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username dan password wajib diisi' });
  }

  const targetRole = (role || 'user') as string;
  if (!isValidRole(targetRole)) {
    throw createError({ statusCode: 400, statusMessage: 'Role tidak valid' });
  }

  if (isDeveloper(targetRole) && !isDeveloper(actorRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Hanya developer yang dapat membuat user dengan role developer'
    });
  }

  let resolvedPpkMasterId: number | null = null;
  if (isPpk(targetRole)) {
    const parsedId = Number(ppk_master_id);
    if (!ppk_master_id || !Number.isFinite(parsedId)) {
      throw createError({ statusCode: 400, statusMessage: 'Pilih data PPK dari Master PPK terlebih dahulu' });
    }
    const ppkList = await loadPpkMaster();
    const ppkExists = ppkList.some((p: any) => Number(p.id) === parsedId);
    if (!ppkExists) {
      throw createError({ statusCode: 400, statusMessage: 'Data PPK tidak ditemukan di Master PPK' });
    }
    resolvedPpkMasterId = parsedId;
  }

  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    throw createError({ statusCode: 400, statusMessage: 'Username sudah digunakan' });
  }

  const mustChangeFlag = must_change_password ? 1 : 0;

  const newUser = {
    id: crypto.randomUUID(),
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    role: targetRole,
    must_change_password: mustChangeFlag,
    ppk_master_id: resolvedPpkMasterId
  };

  await createUser(newUser);

  return {
    success: true,
    data: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      must_change_password: Boolean(mustChangeFlag),
      ppk_master_id: resolvedPpkMasterId
    }
  };
});
