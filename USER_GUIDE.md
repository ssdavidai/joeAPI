# JoeAPI MCP Server - User Guide

## What is This?

Think of this as a **smart assistant for your construction management system**. Instead of clicking through menus and forms in an app, you can simply ask questions in plain English and get answers or create new records instantly.

**Example conversations you can have:**
- "Show me all the action items that are overdue"
- "Create a new client named John Smith with email john@example.com"
- "What proposals do we have for the Smith family project?"
- "List all the subcontractors in the Plumbing category"

Behind the scenes, there are two main parts working together:

1. **JoeAPI** - The REST API (a fancy term for "data warehouse") that stores all your construction data
2. **MCP Server** - The translator that lets AI assistants like Claude understand and interact with your data

---

## How It Works

```
You ask Claude a question
         ↓
Claude uses MCP Tools to fetch data
         ↓
JoeAPI retrieves data from SQL database
         ↓
Claude shows you the answer in plain English
```

### Real Example:

**You say:** "Show me recent action items"

**What happens:**
1. Claude recognizes you want action items
2. Claude uses the `list_action_items` tool
3. The tool calls JoeAPI at `https://joeapi.fly.dev/api/v1/actionitems`
4. JoeAPI queries the SQL database
5. Results come back with 41 action items
6. Claude formats it nicely and shows you the top ones

---

## Available Tools (What Claude Can Do)

The MCP server provides **16 tools** that Claude can use. Think of these like buttons Claude can press to get or create data.

### 📋 Clients (3 tools)

**Who are clients?** The people or companies you're building projects for.

1. **`list_clients`** - View all your clients
   - Search by name, email, or company
   - See results page by page (default: 20 at a time)
   - Example: "Show me all clients with 'Smith' in their name"

2. **`get_client`** - Look up one specific client
   - Uses a unique ID to find exactly one client
   - Example: "Get details for client ID 38BB47CE-32ED-4B7C-B6F3-8F8B80204273"

3. **`create_client`** - Add a new client
   - Required: Name and Email
   - Optional: Company, Phone, Address, City, State
   - Example: "Create a new client: Sarah Johnson, sarah@example.com, phone 555-1234"

---

### 👥 Contacts (2 tools)

**Who are contacts?** People associated with projects (architects, inspectors, suppliers, etc.)

1. **`list_contacts`** - View all contacts
   - Search by name
   - Include or exclude inactive contacts
   - Example: "List all active contacts"

2. **`create_contact`** - Add a new contact
   - Required: Name only
   - Optional: Email, Phone, Address, City, State
   - Example: "Add John the plumber, 555-9999, john.plumber@example.com"

---

### 🔧 Subcontractors (1 tool)

**Who are subcontractors?** Specialized workers you hire (electricians, plumbers, roofers, etc.)

1. **`list_subcontractors`** - View all subcontractors
   - Filter by category (Plumbing, Electrical, Roofing, etc.)
   - Search by name
   - Include or exclude inactive ones
   - Example: "Show me all electrical subcontractors"

---

### 📄 Proposals (2 tools)

**What are proposals?** Project bids/quotes you send to clients showing costs and scope of work.

1. **`list_proposals`** - View all proposals
   - Filter by specific client
   - See amounts, dates, and status (Draft, Accepted, etc.)
   - Include or exclude deleted/archived ones
   - Example: "Show me all accepted proposals from November"

2. **`get_proposal`** - Look up one specific proposal
   - Uses a unique ID
   - Example: "Get proposal #797"

---

### 📊 Proposal Lines (1 tool)

**What are proposal lines?** Individual line items within a proposal (e.g., "Framing: $15,000", "Electrical: $8,500")

1. **`list_proposal_lines`** - View line items
   - Filter by specific proposal ID
   - See the breakdown of costs
   - Example: "Show me all line items for proposal #380"

---

### 💰 Estimates (1 tool)

**What are estimates?** Initial cost calculations before creating formal proposals.

1. **`list_estimates`** - View all estimates
   - See all preliminary cost calculations
   - Example: "List all estimates from this month"

---

### ✅ Action Items (3 tools)

**What are action items?** Tasks, to-dos, and notes that need attention.

1. **`list_action_items`** - View all action items
   - Filter by specific project
   - See title, description, due date, and status
   - Include or exclude deleted/archived items
   - Example: "Show me all overdue action items"

2. **`get_action_item`** - Look up one specific action item
   - Uses a numeric ID (e.g., 404, 409)
   - Example: "Get details for action item #442"

3. **`create_action_item`** - Add a new action item
   - Required: Title, Description, Type, Due Date, Status, Source
   - Optional: Project ID
   - Example: "Create action item: Review permits, due next Friday, high priority"

---

### 📅 Project Schedules (1 tool)

**What are project schedules?** Timeline plans showing when different phases of construction will happen.

1. **`list_project_schedules`** - View all project schedules
   - See all active project timelines
   - Example: "Show me all project schedules"

---

### 📋 Project Schedule Tasks (1 tool)

**What are schedule tasks?** Individual milestones within a schedule (e.g., "Foundation - Week 1", "Framing - Week 3")

1. **`list_project_schedule_tasks`** - View schedule tasks
   - Filter by specific schedule ID
   - See individual milestones and deadlines
   - Example: "Show me all tasks for the Smith project schedule"

---

### 📂 Project Managements (1 tool)

**What is project management data?** Overall project tracking information (budgets, timelines, status)

1. **`list_project_managements`** - View all project management records
   - See high-level project information
   - Example: "List all active projects"

---

## Tools vs Prompts - What's the Difference?

### 🔧 Tools (What We Have Now)

**Tools** are individual actions Claude can take. Think of them like **single buttons**:
- "Get clients" button
- "Create action item" button
- "List proposals" button

**Example using a tool:**
- You: "Show me action items"
- Claude: *presses the `list_action_items` button*
- Result: You get a list of action items

### 💬 Prompts (What We Could Add)

**Prompts** are pre-written complex questions or workflows. Think of them like **macros or shortcuts** that combine multiple tools together.

**Example prompts we could create:**

1. **"Weekly Project Report"**
   - Automatically fetches: Recent action items + Current proposals + Project schedules
   - Formats them into a nice summary
   - You just say: "Run weekly report"

2. **"New Client Onboarding"**
   - Guides you through creating a client
   - Then creates initial action items
   - Then sets up a project schedule
   - You just say: "Onboard new client Sarah"

3. **"Overdue Items Dashboard"**
   - Shows all overdue action items
   - Shows proposals waiting for approval
   - Shows delayed schedule tasks
   - You just say: "What's overdue?"

---

## How to Add Prompts (Technical Overview)

Prompts are defined in the MCP server code at `mcp/index.ts`. Here's how they work:

### Current Code Structure
Right now, our MCP server only has **tools**. It doesn't have any **prompts** yet.

### Where Prompts Would Go

To add prompts, you would:

1. **Define the prompts** in `mcp/index.ts`:

```typescript
import { ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Add this near the tools definition
const prompts = [
  {
    name: 'weekly_report',
    description: 'Generate a weekly project status report',
    arguments: [
      {
        name: 'week',
        description: 'Week to report on (optional, defaults to current week)',
        required: false
      }
    ]
  },
  {
    name: 'overdue_dashboard',
    description: 'Show all overdue items across projects',
    arguments: []
  },
  {
    name: 'project_summary',
    description: 'Comprehensive summary of a specific project',
    arguments: [
      {
        name: 'projectId',
        description: 'The project ID to summarize',
        required: true
      }
    ]
  }
];
```

2. **Add prompt handlers** in the server setup:

```typescript
// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts
}));

// Handle prompt requests
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'weekly_report':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please generate a weekly report by:

1. Listing all action items created or updated this week
2. Showing all proposals with status changes
3. Displaying project schedule updates
4. Highlighting any overdue items

Format this as a professional summary suitable for management review.`
            }
          }
        ]
      };

    case 'overdue_dashboard':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Create an overdue items dashboard:

1. List all action items past their due date
2. Show proposals in "Pending" status for over 30 days
3. Identify any schedule tasks behind timeline
4. Summarize total count and suggest priorities`
            }
          }
        ]
      };

    case 'project_summary':
      const projectId = args?.projectId;
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Generate a complete project summary for project ${projectId}:

1. Get all proposals for this project
2. List all action items for this project
3. Show the project schedule and tasks
4. Calculate total budget and status
5. Highlight any concerns or blockers`
            }
          }
        ]
      };
  }
});
```

3. **Update server capabilities** to include prompts:

```typescript
const server = new Server(
  {
    name: 'joeapi-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      prompts: {},  // Add this line
    },
  }
);
```

### File Location
All of this would be added to: `/Users/Shared/dev/workbench/joeapi/mcp/index.ts`

---

## Using Prompts vs Tools

### Without Prompts (Current Experience)

**You:** "I need a weekly report"

**Claude:** *Has to figure out what you mean*
- Calls `list_action_items`
- Calls `list_proposals`
- Calls `list_project_schedules`
- Manually formats everything
- Returns the report

This works but requires Claude to "think" about what to do each time.

### With Prompts (Future Enhancement)

**You:** "Run weekly report"

**Claude:** *Uses the `weekly_report` prompt*
- The prompt already knows exactly what to fetch
- The prompt includes formatting instructions
- Consistent results every time
- Faster response

---

## Example Usage Scenarios

### Scenario 1: Morning Standup
**You:** "What do I need to focus on today?"

With a **"daily_priorities"** prompt, Claude would:
1. Get all action items due today or overdue
2. Check proposals needing attention
3. Show today's schedule tasks
4. Summarize in priority order

### Scenario 2: Client Meeting Prep
**You:** "Prepare for meeting with client ID 38BB47CE"

With a **"client_meeting_prep"** prompt, Claude would:
1. Get client details
2. List all their proposals
3. Show associated action items
4. Display project schedules
5. Format as a meeting brief

### Scenario 3: Monthly Reporting
**You:** "Generate November report"

With a **"monthly_report"** prompt, Claude would:
1. Total all proposals accepted in November
2. Count completed action items
3. Show projects started/completed
4. Calculate revenue metrics
5. Format as executive summary

---

## What Data Is Available

Currently, the database contains:
- **Clients:** Information about your customers
- **Contacts:** 3rd party people you work with
- **Subcontractors:** Specialists you hire
- **Proposals:** 379 proposals (mix of Draft, Accepted, etc.)
- **Proposal Lines:** Individual cost breakdowns
- **Estimates:** Preliminary quotes
- **Action Items:** 41 tasks and notes
- **Project Schedules:** Timeline plans
- **Schedule Tasks:** Individual milestones
- **Project Management:** Overall project tracking

All of this is accessible through the API at: **https://joeapi.fly.dev**

---

## Tips for Asking Questions

### ✅ Good Questions

- "Show me all action items from Craig Anderson"
- "List proposals with amounts over $1 million"
- "Find all electrical subcontractors"
- "What action items are due this week?"
- "Create a new client: ABC Construction, abc@example.com"

### ❌ Less Effective Questions

- "What's happening?" *(too vague)*
- "Show me everything" *(too broad - use filters)*
- "Fix the Smith project" *(Claude can't directly modify data, only create/read)*

### 💡 Pro Tips

1. **Be specific with filters**: "Show proposals for client ID X" is better than "show all proposals"
2. **Use pagination for large results**: "Show first 5 action items" rather than getting all 41 at once
3. **Combine requests**: "List all accepted proposals and their total amounts"

---

## Security & Privacy

- **Development Mode:** Currently running in dev mode for easy testing
- **User Filtering:** Data is filtered by User ID (currently using DEV_USER_ID=1)
- **Future:** Will add JWT authentication for production use
- **Access:** Only you and authorized team members can access this data

---

## Next Steps

### For Non-Technical Users
1. Just start asking Claude questions about your construction data!
2. Try the example questions above
3. Experiment with combining different requests

### For Technical Users
1. Add **prompts** for common workflows (see technical section above)
2. Enhance authentication for production
3. Add more tools for update/delete operations
4. Create custom business logic prompts

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│  User asks Claude a question            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Claude Code / Claude Desktop           │
│  (AI Assistant)                         │
└─────────────────┬───────────────────────┘
                  │ MCP Protocol
┌─────────────────▼───────────────────────┐
│  JoeAPI MCP Server                      │
│  (mcp/index.ts)                         │
│  - 16 Tools                             │
│  - Future: Prompts                      │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────┐
│  JoeAPI REST API                        │
│  https://joeapi.fly.dev                 │
│  - 10 Endpoints                         │
│  - Authentication                       │
│  - Multi-tenant filtering               │
└─────────────────┬───────────────────────┘
                  │ SQL Queries
┌─────────────────▼───────────────────────┐
│  Azure SQL Server                       │
│  Database: chaconstruction-test         │
│  - Clients, Proposals, Action Items     │
│  - Projects, Schedules, Estimates       │
└─────────────────────────────────────────┘
```

---

## Support & Resources

- **API Documentation:** See `/api/v1` for full endpoint details
- **MCP Documentation:** https://modelcontextprotocol.io
- **Repository:** https://github.com/ssdavidai/joeAPI
- **Deployed API:** https://joeapi.fly.dev
- **Health Check:** https://joeapi.fly.dev/health

---

**Built with Claude Code** 🤖
https://claude.com/claude-code
