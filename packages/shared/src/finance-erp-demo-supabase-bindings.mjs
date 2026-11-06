/** Bind ERP demo persistence and identity to the explicitly allowed staging project. */
export function createErpDemoSupabaseBindings({
  supabaseUrl, serviceRoleKey, identity, fetchImpl = fetch
}) {
  const stagingOrigin = 'https://bsjkohwbtrfwrqcyhsfz.supabase.co';
  if (new URL(supabaseUrl).origin !== stagingOrigin || !serviceRoleKey) {
    throw new Error('ERP demo bindings require OTOTR staging');
  }

  async function authenticate(request) {
    const token = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    return token ? identity.authenticate(token) : null;
  }

  async function requestErpTransactions(path, options = {}) {
    if (!path.startsWith('finance_transactions?')) throw new Error('Invalid ERP demo resource');
    const response = await fetchImpl(stagingOrigin + '/rest/v1/' + path, {
      ...options,
      headers: {
        ...options.headers,
        apikey: serviceRoleKey,
        Authorization: 'Bearer ' + serviceRoleKey,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('ERP demo persistence request failed');
    return options.method === 'POST' ? undefined : response.json();
  }

  return {authenticate, requestErpTransactions};
}
