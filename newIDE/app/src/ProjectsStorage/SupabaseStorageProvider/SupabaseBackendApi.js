// @flow
const API_BASE =
  process.env.REACT_APP_SUPABASE_BACKEND_URL ||
  process.env.SUPABASE_BACKEND_URL ||
  process.env.VITE_SUPABASE_BACKEND_URL ||
  '';

const CRED_KEY = 'supabase_device_credentials';

function assertApiBase() {
  if (!API_BASE) {
    throw new Error(
      'Falta REACT_APP_SUPABASE_BACKEND_URL (o SUPABASE_BACKEND_URL).'
    );
  }
}

async function fetchWithTimeout(url: string, options: any, timeoutMs: number = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function ensureDeviceCredentials(): Promise<{|
  deviceId: string,
  deviceToken: string,
|}> {
  assertApiBase();

  const cached = localStorage.getItem(CRED_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed?.deviceId && parsed?.deviceToken) return parsed;
    } catch (_e) {}
    localStorage.removeItem(CRED_KEY);
  }

  const res = await fetchWithTimeout(`${API_BASE}/register-device`, {
    method: 'POST',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to register device (${res.status}). ${text}`);
  }

  const creds = await res.json();
  if (!creds?.deviceId || !creds?.deviceToken) {
    throw new Error('Invalid register-device response.');
  }

  localStorage.setItem(CRED_KEY, JSON.stringify(creds));
  return creds;
}

export async function saveProjectToBackend({
  projectId,
  name,
  json,
}: {|
  projectId: string,
  name: string,
  json: Object,
|}): Promise<void> {
  assertApiBase();

  const { deviceId, deviceToken } = await ensureDeviceCredentials();

  const res = await fetchWithTimeout(`${API_BASE}/projects/${projectId}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-device-id': deviceId,
      'x-device-token': deviceToken,
    },
    body: JSON.stringify({ name, json }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Save failed (${res.status}). ${text}`);
  }
}

export async function openProjectFromBackend({
  projectId,
}: {|
  projectId: string,
|}): Promise<Object> {
  assertApiBase();

  const { deviceId, deviceToken } = await ensureDeviceCredentials();

  const res = await fetchWithTimeout(`${API_BASE}/projects/${projectId}/open`, {
    method: 'GET',
    headers: {
      'x-device-id': deviceId,
      'x-device-token': deviceToken,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Open failed (${res.status}). ${text}`);
  }

  return await res.json();
}
