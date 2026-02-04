# Genetic Data Query Skill

Use this skill when the user wants to query their genetic data from Genetic Explorer.

## Prerequisites

The user must authenticate using the `genetic-mcp` CLI:

```bash
# Install
pnpm add -g genetic-mcp

# Authenticate
genetic-mcp login
# Then paste their API token from Settings > Authorized Applications
```

## Tools Available

### Genome Tools
| Tool | Description |
|------|-------------|
| `get_genome_summary` | Get genome summary with SNP count |
| `get_genome_stats` | Get quality metrics |
| `search_snps` | Search by RSID or gene |

### Health Tools
| Tool | Description |
|------|-------------|
| `get_health_profile` | Get genetic traits |
| `get_carrier_status` | Get carrier screening |
| `get_ancestry_composition` | Get ancestry breakdown |

## Usage Examples

- "What does my genome look like?" → `get_genome_summary`
- "Tell me about rs12345" → `search_snps` with query "rs12345"
- "Am I a carrier for anything?" → `get_carrier_status`
- "What is my ancestry?" → `get_ancestry_composition`

## Authentication

Users need to create a token at https://genetic-explorer.app/settings/authorized-apps
