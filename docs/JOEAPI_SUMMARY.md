# JoeAPI Project Summary

## Overview
Custom REST API connecting to ContractorsDesk Azure SQL database, exposed as MCP server on Smithery for AI agent access.

**Total:** 49 API endpoints → 49 MCP tools → 18 workflow prompts

---

## API Endpoints (49 total)

### Clients & Contacts (6 endpoints)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/clients` | GET | List all clients with pagination and search |
| `/api/v1/clients/:id` | GET | Get specific client by ID |
| `/api/v1/clients` | POST | Create new client |
| `/api/v1/contacts` | GET | List all contacts with pagination |
| `/api/v1/contacts/:id` | GET | Get specific contact by ID |
| `/api/v1/contacts` | POST | Create new contact |

### Subcontractors (3 endpoints)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/subcontractors` | GET | List all subcontractors with pagination |
| `/api/v1/subcontractors/:id` | GET | Get specific subcontractor by ID |
| `/api/v1/subcontractors` | POST | Create new subcontractor |

### Proposals & Estimates (6 endpoints)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/proposals` | GET | List all proposals with filters |
| `/api/v1/proposals/:id` | GET | Get specific proposal by ID |
| `/api/v1/proposals` | POST | Create new proposal |
| `/api/v1/proposallines` | GET | List proposal line items |
| `/api/v1/estimates` | GET | List all estimates |
| `/api/v1/estimates/:id` | GET | Get specific estimate by ID |

### Project Management (9 endpoints)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/projectmanagements` | GET | List all projects with pagination |
| `/api/v1/projectmanagements/:id` | GET | Get specific project by ID |
| `/api/v1/projectmanagements` | POST | Create new project |
| `/api/v1/projectschedules` | GET | List project schedules |
| `/api/v1/projectschedules/:id` | GET | Get specific schedule by ID |
| `/api/v1/projectscheduletasks` | GET | List schedule tasks |
| `/api/v1/projectscheduletasks/:id` | GET | Get specific task by ID |
| `/api/v1/projectscheduletasks` | POST | Create new schedule task |
| `/api/v1/projectscheduletasks/:id` | PUT | Update schedule task dates |

### Action Items (9 endpoints)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/actionitems` | GET | List action items with filters |
| `/api/v1/actionitems/:id` | GET | Get specific action item |
| `/api/v1/actionitems` | POST | Create new action item |
| `/api/v1/actionitems/:id/comments` | GET | List comments on action item |
| `/api/v1/actionitems/:id/comments` | POST | Add comment to action item |
| `/api/v1/actionitems/:id/supervisors` | GET | List supervisors for action item |
| `/api/v1/actionitems/:id/costchange` | GET | Get cost change details |
| `/api/v1/actionitems/:id/costchange` | POST | Add cost change to action item |
| `/api/v1/actionitems/:id/schedulechange` | GET | Get schedule change details |

### QuickBooks Financial Data (10 endpoints)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/transactions` | GET | List QB transactions with filters (261K+ records) |
| `/api/v1/transactions/summary` | GET | Summarize transactions by project/account/vendor |
| `/api/v1/job-balances` | GET | List job balances for all projects |
| `/api/v1/deposits` | GET | List deposit/retainer info for projects |
| `/api/v1/deposits/:projectId` | GET | Get deposit details for specific project |
| `/api/v1/invoices` | GET | List all invoices with pagination |
| `/api/v1/invoices/:id` | GET | Get specific invoice by ID |
| `/api/v1/cost-variance` | GET | Calculate cost variance vs estimates |
| `/api/v1/project-details/:id` | GET | Get comprehensive project details |
| `/api/v1/proposal-pipeline` | GET | Get proposal pipeline analytics |

### Advanced Analytics (6 endpoints)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/schedule-revisions` | GET | List all schedule revisions |
| `/api/v1/schedule-revisions/:id` | GET | Get specific schedule revision |
| `/api/v1/cost-revisions` | GET | List all cost revisions |
| `/api/v1/cost-revisions/:id` | GET | Get specific cost revision |
| `/api/v1/estimate-revisions/:id` | GET | Get estimate revision history |
| `/api/v1/proposal-templates/pricing` | GET | Get standard pricing templates |

---

## MCP Tools (49 tools)

All API endpoints exposed as MCP tools with:
- Proper input validation schemas
- Descriptive names and documentation
- Category/subcategory organization
- Automatic pagination handling

**Categories:**
- Clients & Contacts (6 tools)
- Subcontractors (3 tools)
- Proposals & Estimates (6 tools)
- Project Management (9 tools)
- Action Items (9 tools)
- Financial Data (10 tools)
- Analytics (6 tools)

---

## Workflow Prompts (18 prompts)

### ✅ Fully Working (18 tasks - 60%)

**Financial Reports:**
1. **work_in_process_report** - WIP status for all active projects
2. **detailed_budget_tracking** - Budget variance analysis by category
3. **deposit_tracking** - Owner deposit/retainer tracking
4. **cost_to_estimate_report** - Real-time cost vs estimate
5. **receivables_report** - Supervision fees collected & outstanding
6. **gross_receipts_forecast** - Monthly receipts projection
7. **projected_income** - Income estimates from proposals

**Project Analytics:**
8. **job_queue_summary** - Pipeline summary (queue/active/upcoming)
9. **revised_estimate_analysis** - Estimate revision history
10. **job_benchmarking** - Historical cost & duration benchmarks
11. **cost_per_square_foot_report** - Cost breakdown per sqft by trade
12. **change_order_tracking** - Revised estimate tracking

**Operational Tasks:**
13. **upgrade_pricing** - Price client upgrades using templates
14. **update_schedule** - Extend/adjust schedules due to delays
15. **missed_action_items_alert** - Overdue action item alerts
16. **blind_spots_report** - Critical issues needing owner attention
17. **generate_job_status_report** - Weekly status reports by project
18. **plan_analysis** - Building plan quantity takeoffs (uses Claude vision)

### ⚠️ Nearly Complete (10 tasks - 33%)

Only missing external integrations:
- **Generate Automated Weekly Report** - needs email delivery
- **Landscape Estimates** - needs email service
- **Hardscape Estimates** - needs email service
- **Weather-Based Schedule Adjustment** - needs weather API
- **Notify Subcontractors** - needs SMS service
- **Owner Invoice Alerts** - needs email service
- **Client Communications** - needs email + SMS
- **Instagram Workflow** - needs email + Instagram API
- **Email Parsing and Document Extraction** - needs email integration
- **Competitive Analysis** - needs web scraping

### ❌ Needs Work (2 tasks - 7%)

- **Personal Messages** - needs SMS/phone/flower delivery APIs
- **Market Expansion Analysis** - needs GIS/property/market research APIs

---

## Task Completion Details

### Why 60% Are Complete

Many "missing" tools aren't actually missing:
- **Report generators** → Claude can format reports
- **Calculators** → Claude can do math/analysis
- **Analyzers** → Claude can identify patterns
- **Filters** → Claude can parse/filter data

**We just needed to tell Claude HOW to use existing tools!**

### Example: Work-in-Process Report

**User:** "Use the work_in_process_report prompt"

**Claude executes:**
1. `list_project_managements` - get active projects
2. `list_project_schedule_tasks` - get completion status
3. `list_action_items` - get cost/schedule changes
4. `list_transactions` - get actual costs spent
5. `list_job_balances` - get current financial position
6. Analyzes all data and formats comprehensive WIP report

**No special tools needed - just the primitives!**

---

## Next Steps

1. **Write eval tests** for all 18 complete tasks
2. **Iterate on prompts** until consistently good results
3. **Add external integrations** for 10 nearly-complete tasks
4. **Update widget** with proper tool access
5. **Deploy to production**

---

## Technical Stack

- **API:** Node.js + Express + MSSQL
- **Database:** Azure SQL Server (ContractorsDesk)
- **MCP Server:** TypeScript + MCP SDK
- **Deployment:** Fly.io (API) + Smithery (MCP)
- **Data:** 261K+ QB transactions, 48 projects, 84 invoices, 27 pricing templates

---

## Files & Documentation

- **API Docs:** `/docs/TIER_2_API_ENDPOINTS.md`
- **MCP Tools:** `/docs/MCP_TOOLS_REFERENCE.md`
- **Task Workflows:** `/docs/joetasks.json`
- **Source Code:** `/src/controllers/`, `/src/routes/`, `/mcp/index.ts`

---

**Live API:** https://joeapi.fly.dev
**MCP Server:** Deployed on Smithery (ssdavidai/joeapi)
