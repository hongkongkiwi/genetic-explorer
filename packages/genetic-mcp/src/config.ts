/**
 * Configuration Module
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, homedir } from 'path';

const CONFIG_DIR = join(homedir(), '.config', 'genetic-mcp');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

interface Config { apiUrl: string; token: string | null; tokenStoredAt: string | null }

function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
}

function loadConfig(): Config {
  ensureConfigDir();
  if (!existsSync(CONFIG_FILE)) return { apiUrl: 'https://genetic-explorer.app', token: null, tokenStoredAt: null };
  try { return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')); }
  catch { return { apiUrl: 'https://genetic-explorer.app', token: null, tokenStoredAt: null }; }
}

function saveConfig(config: Config) {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function setToken(token: string) {
  const config = loadConfig();
  config.token = token;
  config.tokenStoredAt = new Date().toISOString();
  saveConfig(config);
}

export function getToken(): string | null { return loadConfig().token; }
export function clearToken() { saveConfig({ apiUrl: 'https://genetic-explorer.app', token: null, tokenStoredAt: null }); }
export function isAuthenticated(): boolean { return loadConfig().token !== null; }
export function getApiUrl(): string { return loadConfig().apiUrl || 'https://genetic-explorer.app'; }
