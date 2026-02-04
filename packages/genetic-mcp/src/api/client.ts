/**
 * API Client Module
 */

const CONFIG_FILE = process.env.HOME + '/.config/genetic-mcp/config.json';

interface Config { apiUrl: string; token: string | null }

function loadConfig(): Config {
  try {
    return JSON.parse(require('fs').readFileSync(CONFIG_FILE, 'utf-8'));
  } catch { return { apiUrl: 'https://genetic-explorer.app', token: null }; }
}

function getToken(): string | null { return loadConfig().token; }
function getApiUrl(): string { return loadConfig().apiUrl || 'https://genetic-explorer.app'; }

async function apiRequest<T>(endpoint: string): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getToken();
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const response = await fetch(getApiUrl() + endpoint, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getMe() { return apiRequest('/api/auth/me'); }
export async function getGenomeSummary() { return apiRequest('/api/genomes'); }
export async function getHealthProfile() { return apiRequest('/api/health-profile'); }
export async function getAncestryComposition() { return apiRequest('/api/ancestry'); }
export async function searchSnp(rsid: string) { return apiRequest(`/api/genome/${rsid}`); }
