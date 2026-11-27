import bcrypt from 'bcryptjs';
import { findUserById, getDefaultDevCredentials, updateUserPassword } from '../../utils/userManager';
import { issueAuthSessionCookies } from '../../utils/authSession';

export default defineEventHandler(async (event) => {
  const sessionUser = event.context.user as { id?: string } | undefined;
  if (!sessionUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Silakan login kembali' });
  }

  const body = await readBody(event);
  const { currentPassword, newPassword, confirmPassword } = body || {};

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Seluruh kolom password wajib diisi' });
  }

  if (String(newPassword).length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password baru minimal 8 karakter' });
  }

  if (newPassword !== confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Konfirmasi password baru tidak cocok' });
  }

  if (newPassword === currentPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Password baru tidak boleh sama dengan password lama' });
  }

  const dbUser = await findUserById(sessionUser.id);
  if (!dbUser) {
    throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan' });
  }

  if (!bcrypt.compareSync(currentPassword, dbUser.passwordHash)) {
    throw createError({ statusCode: 400, statusMessage: 'Password saat ini salah' });
  }

  const devCreds = getDefaultDevCredentials();
  if (dbUser.role === 'developer' && newPassword === devCreds.password) {
    throw createError({ statusCode: 400, statusMessage: 'Password baru tidak boleh menggunakan password default' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  await updateUserPassword(dbUser.id, newHash, false);

  // Perbarui token sesi tanpa flag mustChangePassword
  issueAuthSessionCookies(event, dbUser, false);

  return {
    success: true,
    message: 'Password berhasil diperbarui'
  };
});
