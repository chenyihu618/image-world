import type { ScenicSpot, TravelNote } from './types';

const BASE = '';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Request failed' })); throw new Error(err.error || `HTTP ${res.status}`); }
  return res.json();
}

// Auth
export const auth = {
  login: (username: string, password: string) => request('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username: string, password: string, email?: string) => request('/api/register', { method: 'POST', body: JSON.stringify({ username, password, email }) }),
  me: () => request('/api/me'),
};

// Spots
export const spots = {
  list: () => request('/api/spots'),
  get: (id: string) => request(`/api/spots/${id}`),
  create: (data: any) => request('/api/spots', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/api/spots/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/api/spots/${id}`, { method: 'DELETE' }),
};

// Photos
export const photos = {
  list: (spotCode: string) => request(`/api/photos?spotId=${spotCode}`),
  upload: async (spotCode: string, files: File[]): Promise<any[]> => {
    const results = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('spotId', spotCode);
      const result = await request('/api/upload', { method: 'POST', body: formData });
      results.push(result);
    }
    return results;
  },
};

// Notes
export const notes = {
  list: (spotCode: string) => request(`/api/note?spotId=${spotCode}`),
  create: (data: { spotId: string; author: string; title: string; content: string }) => request('/api/note', { method: 'POST', body: JSON.stringify(data) }),
};