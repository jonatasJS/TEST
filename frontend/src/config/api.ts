const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  [key: string]: any;
}

export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Garantir envio de cookies de sessão
  options.credentials = 'include';
  
  // Mapear headers padrão
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  options.headers = headers;

  const response = await fetch(url, options);

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data?.message || `Erro na requisição: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return data as T;
};
