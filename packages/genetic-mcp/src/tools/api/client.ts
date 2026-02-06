/**
 * API Client for Genetic Explorer
 */

import { getToken, getApiUrl } from '../../config';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserData {
  email: string;
  id: string;
  displayName?: string;
}

export interface GenomeSummary {
  filename: string;
  snpCount: number;
  status: string;
}

export interface SnpData {
  rsid: string;
  chromosome: string;
  position: number;
  genotype?: string;
}

export interface AncestryData {
  populations: Array<{ name: string; percentage: number }>;
}

async function apiFetch<T>(endpoint: string): Promise<ApiResponse<T>> {
  const token = getToken();
  const baseUrl = getApiUrl();
  
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${baseUrl}/api${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: 'Unauthorized - please login again' };
      }
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getMe(): Promise<ApiResponse<UserData>> {
  return apiFetch<UserData>('/users/me');
}

export async function getGenomeSummary(): Promise<ApiResponse<GenomeSummary>> {
  return apiFetch<GenomeSummary>('/genome/summary');
}

export async function getHealthProfile(): Promise<ApiResponse<unknown>> {
  return apiFetch('/health/profile');
}

export async function getAncestryComposition(): Promise<ApiResponse<AncestryData>> {
  return apiFetch<AncestryData>('/ancestry/composition');
}

export async function searchSnp(query: string): Promise<ApiResponse<SnpData>> {
  return apiFetch<SnpData>(`/search/snp?q=${encodeURIComponent(query)}`);
}
