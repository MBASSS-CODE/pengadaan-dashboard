import { clearAuthSessionCookies } from '../../utils/authSession';

export default defineEventHandler((event) => {
  clearAuthSessionCookies(event);
  return { success: true };
});
