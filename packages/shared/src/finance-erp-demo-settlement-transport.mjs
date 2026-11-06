export function createErpDemoSettlementTransport({handle, allowedOrigins}) {
  const origins = new Set(allowedOrigins);
  return async function respond(request) {
    const origin = request.headers.get('Origin');
    if (origin && !origins.has(origin)) {
      return Response.json({code: 'ORIGIN_DENIED'}, {status: 403, headers: {'Cache-Control': 'no-store'}});
    }

    const headers = new Headers({'Cache-Control': 'no-store', Vary: 'Origin'});
    if (origin) headers.set('Access-Control-Allow-Origin', origin);

    if (request.method === 'OPTIONS') {
      headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'authorization, apikey, content-type');
      return new Response(null, {status: 204, headers});
    }

    const result = await handle(request);
    for (const [key, value] of result.headers) headers.set(key, value);
    return new Response(result.body, {status: result.status, headers});
  };
}
