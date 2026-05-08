type RequestOptions = {
  headers?: Record<string, string>;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  timeout?: number;
};

export async function GET<T = any>(url: string, options: RequestOptions = {}) {
  return request<T>('GET', url, undefined, options);
}

export async function POST<T = any>(url: string, body?: unknown, options: RequestOptions = {}) {
  return request<T>('POST', url, body, options);
}

async function request<T>(method: string, url: string, body: unknown, options: RequestOptions) {
  const controller = new AbortController();
  const timeout = options.timeout ? setTimeout(() => controller.abort(), options.timeout) : undefined;
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const init: RequestInit = {
    method,
    headers,
    signal: controller.signal
  };

  if (body !== undefined) {
    if (isFormData || typeof body === 'string' || body instanceof Blob || body instanceof ArrayBuffer) {
      init.body = body as BodyInit;
    } else {
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      init.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, init);
    const data = await readResponse(response, options.responseType);
    if (!response.ok) {
      const error = new Error(`Request failed with status ${response.status}`) as Error & {
        response?: { status: number; data: unknown };
      };
      error.response = { status: response.status, data };
      throw error;
    }
    return { data: data as T, status: response.status, headers: response.headers };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function readResponse(response: Response, responseType?: RequestOptions['responseType']) {
  if (responseType === 'blob') return response.blob();
  if (responseType === 'arraybuffer') return response.arrayBuffer();
  if (responseType === 'text') return response.text();

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
