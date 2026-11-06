/** Request a short-lived token for the dedicated staging finance worker. */
export function createStagingFinanceWorkerTokenProvider({
  supabaseUrl, publishableKey, email, password, fetchImpl = fetch
}) {
  const origin = 'https://bsjkohwbtrfwrqcyhsfz.supabase.co';
  if (new URL(supabaseUrl).origin !== origin ||
      !publishableKey?.startsWith('sb_publishable_') || !email || !password) {
    throw new Error('Staging finance worker credentials are required');
  }

  let pending;
  let accessToken;
  let expiresAt = 0;
  return async function getWorkerAccessToken() {
    if (Date.now() < expiresAt) return accessToken;
    pending ??= (async () => {
      const response = await fetchImpl(origin + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {apikey: publishableKey, 'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });
      if (!response.ok) throw new Error('Staging finance worker sign-in failed');
      const session = await response.json();
      if (typeof session.access_token !== 'string' || !Number.isFinite(session.expires_in)) {
        throw new Error('Invalid staging finance worker session');
      }
      accessToken = session.access_token;
      expiresAt = Date.now() + Math.max(0, session.expires_in - 60) * 1000;
      return accessToken;
    })().finally(() => { pending = undefined; });
    return pending;
  };
}
