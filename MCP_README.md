# JoeAPI MCP Server

Model Context Protocol server for JoeAPI Construction Management System.

## Overview

This MCP server exposes all 10 Tier 1 APIs from JoeAPI as MCP tools, allowing AI assistants like Claude to interact with your construction management data naturally.

## Available Tools

### Clients (Multi-tenant)
- `list_clients` - Get paginated list of clients
- `get_client` - Get specific client by ID
- `create_client` - Create new client

### Contacts
- `list_contacts` - Get paginated list of contacts
- `create_contact` - Create new contact

### SubContractors
- `list_subcontractors` - Get paginated list with category filtering

### Proposals
- `list_proposals` - Get proposals with filtering options
- `get_proposal` - Get specific proposal

### Proposal Lines
- `list_proposal_lines` - Get proposal line items

### Estimates
- `list_estimates` - Get estimates

### Action Items
- `list_action_items` - Get action items with filtering
- `get_action_item` - Get specific action item
- `create_action_item` - Create new action item

### Project Schedules
- `list_project_schedules` - Get project schedules

### Project Schedule Tasks
- `list_project_schedule_tasks` - Get schedule tasks

### Project Managements
- `list_project_managements` - Get project managements

## Local Testing

### 1. Build the MCP server:
```bash
npm run mcp:build
```

### 2. Test with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "joeapi": {
      "command": "node",
      "args": [
        "/absolute/path/to/joeapi/mcp-build/index.js"
      ],
      "env": {
        "JOEAPI_BASE_URL": "http://localhost:8080"
      }
    }
  }
}
```

### 3. Start your JoeAPI server:
```bash
npm start
```

### 4. Restart Claude Desktop

You should now see JoeAPI tools available in Claude!

## Deployment to Smithery

### Prerequisites
1. ✅ Public GitHub repo: https://github.com/ssdavidai/joeAPI
2. ✅ `smithery.yaml` configuration file
3. ✅ TypeScript MCP server code

### Deploy Steps

**Option 1: Using Smithery CLI**
```bash
# Install Smithery CLI
npm install -g @smithery/cli

# Login
smithery login

# Deploy
smithery deploy .
```

**Option 2: Using Smithery Web Interface**
1. Go to https://smithery.ai
2. Sign in with GitHub
3. Connect your `joeAPI` repository
4. Smithery will automatically detect `smithery.yaml`
5. Click "Deploy"

### Remote Usage

Once deployed, users can add your MCP server to Claude:

```json
{
  "mcpServers": {
    "joeapi": {
      "url": "https://smithery.ai/server/@ssdavidai/joeapi-mcp"
    }
  }
}
```

No local installation needed!

## Configuration

### Environment Variables

**Local Development:**
- `JOEAPI_BASE_URL` - JoeAPI base URL (default: `http://localhost:8080`)

**Smithery Deployment:**
- Update `JOEAPI_BASE_URL` in `smithery.yaml` to your deployed API URL

## Example Interactions

Once connected, you can ask Claude:

- "Show me all active clients"
- "List the most recent action items"
- "Create a new action item titled 'Review permits' due next Friday"
- "What proposals do we have for client XYZ?"
- "Show me all subcontractors in the Plumbing category"

Claude will use the MCP tools to fetch and create data from your construction management system!

## Architecture

```
┌─────────────────┐
│  Claude/AI      │
└────────┬────────┘
         │ MCP Protocol
         ↓
┌─────────────────┐
│  MCP Server     │  ← mcp/index.ts
│  (16 tools)     │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│  JoeAPI         │  ← src/app.js
│  (10 APIs)      │
└────────┬────────┘
         │ SQL
         ↓
┌─────────────────┐
│  SQL Server     │
│  chaconstruction│
└─────────────────┘
```

## Development

Build and test locally:
```bash
# Build TypeScript
npm run mcp:build

# Run in dev mode (hot reload)
npm run mcp:dev

# Run built version
npm run mcp:start
```

## Security Notes

- **No authentication** in MCP server (development mode)
- JoeAPI uses JWT authentication with DEV_USER_ID=1 in development
- For production:
  - Deploy JoeAPI with proper authentication
  - Update JOEAPI_BASE_URL to production URL
  - Consider adding authentication to MCP server

## License

ISC

---

**Built with Claude Code** 🤖
https://claude.com/claude-code
