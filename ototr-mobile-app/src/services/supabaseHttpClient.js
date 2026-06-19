export function isNativeRuntime() {
  const capacitor = globalThis.Capacitor;
  if (!capacitor) return false;
  if (typeof capacitor.isNativePlatform === "function") return capacitor.isNativePlatform();
  return Boolean(capacitor.Plugins?.CapacitorHttp);
}

export function shouldUseNativeHttp(url = "") {
  return isNativeRuntime() && String(url).startsWith("http://");
}

function normalizeHeaders(headers = {}) {
  return Object.fromEntries(
    Object.entries(headers || {}).map(([key, value]) => [key, String(value)])
  );
}

function createNativeResponse(result = {}) {
  const status = Number(result.status || 0);
  const data = result.data;
  const text = typeof data === "string"
    ? data
    : data == null
      ? ""
      : JSON.stringify(data);

  return {
    ok: status >= 200 && status < 300,
    status,
    headers: result.headers || {},
    text: async () => text,
    json: async () => {
      if (typeof data === "string") return data ? JSON.parse(data) : null;
      return data ?? null;
    }
  };
}

export async function supabaseRequest(url, options = {}) {
  if (!shouldUseNativeHttp(url)) {
    return fetch(url, options);
  }

  const http = globalThis.Capacitor?.Plugins?.CapacitorHttp;
  if (!http?.request) {
    return fetch(url, options);
  }

  const method = String(options.method || "GET").toUpperCase();
  const headers = normalizeHeaders(options.headers || {});
  const body = options.body;
  const request = {
    url,
    method,
    headers,
    responseType: "text"
  };

  if (options.dataType) request.dataType = options.dataType;
  if (options.responseType) request.responseType = options.responseType;

  if (body !== undefined && body !== null) {
    request.data = typeof body === "string" ? body : JSON.stringify(body);
  }

  return createNativeResponse(await http.request(request));
}
