import { getUsers, User } from '../../utils/userManager';

export default defineEventHandler(async (event) => {
  const users = await getUsers();
  // Hilangkan passwordHash sebelum dikirim ke frontend
  const safeUsers = users.map((u: User) => ({ id: u.id, username: u.username, role: u.role }));
  
  return { success: true, data: safeUsers };
});
