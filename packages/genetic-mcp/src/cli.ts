#!/usr/bin/env node
/**
 * Genetic MCP CLI
 *
 * Command-line interface for querying genetic data from Genetic Explorer.
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import open from 'open';
import { loadConfig, getToken, setToken, clearToken, isAuthenticated } from './config';
import * as client from './tools/api/client';
import type { UserData, GenomeSummary, SnpData } from './tools/api/client';

const program = new Command();

program.name('genetic-mcp').description('Query your genetic data from the command line').version('1.0.0');

program.command('login').description('Authenticate with your Genetic Explorer account').action(async () => {
  console.log('\n🔐 Genetic Explorer Login\n');
  console.log('1. Go to Settings > Authorized Applications');
  console.log('2. Create a new application');
  console.log('3. Copy your API token\n');

  const { token } = await inquirer.prompt([
    { type: 'password', name: 'token', message: 'Paste your API token:', validate: (input: string) => input.length > 0 || 'Token is required' },
  ]);

  setToken(token);
  const response = await client.getMe();

  if (response.success && response.data) {
    console.log(`\n✓ Authenticated as ${response.data.email}`);
  } else {
    clearToken();
    console.log(`\n✗ Authentication failed: ${response.error}`);
    process.exit(1);
  }
});

program.command('logout').description('Remove stored authentication token').action(() => {
  clearToken();
  console.log('✓ Logged out successfully');
});

program.command('status').description('Show current authentication status').action(async () => {
  if (!isAuthenticated()) {
    console.log('Not authenticated. Run "genetic-mcp login" first.');
    return;
  }
  const response = await client.getMe();
  if (response.success && response.data) {
    console.log(`Authenticated as: ${response.data.email}`);
  } else {
    console.log(`Error: ${response.error}`);
  }
});

program.command('genome').description('Show genome summary').action(async () => {
  if (!isAuthenticated()) { console.log('Not authenticated.'); process.exit(1); }
  const response = await client.getGenomeSummary();
  if (response.success && response.data) {
    const g = response.data;
    console.log(`Genome: ${g.filename}\nSNPs: ${g.snpCount.toLocaleString()}\nStatus: ${g.status}`);
  } else {
    console.log(`Error: ${response.error}`);
  }
});

program.command('health').description('Show health profile').action(async () => {
  if (!isAuthenticated()) { console.log('Not authenticated.'); process.exit(1); }
  const response = await client.getHealthProfile();
  if (response.success && response.data) {
    console.log('Health profile loaded');
  } else {
    console.log(`Error: ${response.error}`);
  }
});

program.command('ancestry').description('Show ancestry composition').action(async () => {
  if (!isAuthenticated()) { console.log('Not authenticated.'); process.exit(1); }
  const response = await client.getAncestryComposition();
  if (response.success && response.data) {
    console.log('Ancestry composition loaded');
  } else {
    console.log(`Error: ${response.error}`);
  }
});

program.command('search <query>').description('Search for SNP by RSID or gene').action(async (query: string) => {
  if (!isAuthenticated()) { console.log('Not authenticated.'); process.exit(1); }
  const response = await client.searchSnp(query);
  if (response.success && response.data) {
    const s = response.data;
    console.log(`RSID: ${s.rsid}\nChromosome: ${s.chromosome}\nPosition: ${s.position}\nGenotype: ${s.genotype || 'N/A'}`);
  } else {
    console.log(`Not found: ${response.error}`);
  }
});

program.command('open').description('Open Genetic Explorer in your browser').action(() => {
  open('https://genetic-explorer.app');
});

program.parse();
