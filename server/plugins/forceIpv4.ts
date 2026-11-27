import dns from 'node:dns';
import net from 'node:net';

/**
 * Ensure Node.js prioritizes IPv4 and disables Happy Eyeballs auto-selection
 * so outbound requests on dual-stack hosts (e.g. Hostinger) do not unexpectedly
 * route through an unwhitelisted IPv6 address.
 */
export default defineNitroPlugin(() => {
  try {
    dns.setDefaultResultOrder('ipv4first');
    if (typeof net.setDefaultAutoSelectFamily === 'function') {
      net.setDefaultAutoSelectFamily(false);
    }
    console.log('[Network] Default DNS result order set to ipv4first (autoSelectFamily disabled).');
  } catch (error) {
    console.warn('[Network] Failed to configure IPv4-first DNS order:', error);
  }
});
