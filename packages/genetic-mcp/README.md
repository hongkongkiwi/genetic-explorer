# Genetic MCP Server & CLI

Query your genetic data from the command line or through Claude Code.

## Installation

```bash
git clone https://github.com/hongkongkiwi/genetic-explorer
cd genetic-explorer/packages/genetic-mcp
pnpm install && pnpm build
```

## Quick Start

1. Create API token: https://genetic-explorer.app/settings/authorized-apps
2. Authenticate: `genetic-mcp login`
3. Query: `genetic-mcp genome`

## CLI Commands

| Command | Description |
|---------|-------------|
| `login` | Authenticate with API token |
| `logout` | Remove stored token |
| `status` | Show auth status |
| `genome` | Show genome summary |
| `health` | Show health profile |
| `ancestry` | Show ancestry |
| `search <query>` | Search SNP |
| `open` | Open in browser |

## MCP Server

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "genetic": {
      "command": "genetic-mcp",
      "args": ["server"]
    }
  }
}
```

## Available Tools

- `get_genome_summary` - Genome summary
- `get_genome_stats` - Quality metrics
- `search_snps` - Search by RSID/gene
- `get_health_profile` - Health traits
- `get_carrier_status` - Carrier screening
- `get_ancestry_composition` - Ancestry breakdown
