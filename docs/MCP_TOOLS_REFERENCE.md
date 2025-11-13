# JoeAPI MCP Tools Reference

**Version:** 1.2.0
**Total Tools:** 49

## Overview

The JoeAPI MCP Server exposes 49 tools for interacting with the construction management system. These tools are organized into 18 main categories covering basic operations and advanced financial/analytics capabilities.

---

## 1. Clients (3 tools)

### `list_clients`
Get paginated list of clients (multi-tenant, filtered by user)

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)
- `search` (string, optional) - Search term for name, email, or company

### `get_client`
Get a specific client by ID

**Parameters:**
- `id` (string, required) - Client ID (GUID)

### `create_client`
Create a new client

**Parameters:**
- `Name` (string, required) - Client name
- `EmailAddress` (string, required) - Email address
- `CompanyName` (string, optional) - Company name
- `Phone` (string, optional) - Phone number
- `Address` (string, optional) - Street address
- `City` (string, optional) - City
- `State` (string, optional) - State

---

## 2. Contacts (2 tools)

### `list_contacts`
Get paginated list of contacts

**Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `search` (string, optional)
- `includeInactive` (boolean, optional)

### `create_contact`
Create a new contact

**Parameters:**
- `Name` (string, required)
- `Email` (string, optional)
- `Phone` (string, optional)
- `Address` (string, optional)
- `City` (string, optional)
- `State` (string, optional)

---

## 3. Subcontractors (1 tool)

### `list_subcontractors`
Get paginated list of subcontractors

**Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `search` (string, optional)
- `category` (string, optional) - Filter by category (e.g., Plumbing, Electrical)
- `includeInactive` (boolean, optional)

---

## 4. Proposals (3 tools)

### `list_proposals`
Get paginated list of proposals

**Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `clientId` (string, optional) - Filter by client ID
- `includeDeleted` (boolean, optional)
- `includeArchived` (boolean, optional)

### `get_proposal`
Get a specific proposal by ID

**Parameters:**
- `id` (string, required) - Proposal ID (GUID)

### `list_proposal_lines`
Get proposal line items

**Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `proposalId` (string, optional) - Filter by proposal ID

---

## 5. Estimates (1 tool)

### `list_estimates`
Get paginated list of estimates

**Parameters:**
- `page` (number, optional)
- `limit` (number, optional)

---

## 6. Action Items - Base (3 tools)

### `list_action_items`
Get paginated list of action items

**Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `projectId` (string, optional) - Filter by project ID
- `includeDeleted` (boolean, optional)
- `includeArchived` (boolean, optional)

### `get_action_item`
Get a specific action item by ID with all nested data (comments, supervisors, cost/schedule changes)

**Parameters:**
- `id` (number, required) - Action item ID (integer)

**Returns:** Complete action item with CostChange, ScheduleChange, Comments, and Supervisors arrays

### `create_action_item`
Create a new action item with optional nested data

**Parameters:**
- `Title` (string, required) - Action item title
- `Description` (string, required) - Detailed description
- `ProjectId` (string, optional) - Related project ID (GUID)
- `ActionTypeId` (number, required) - Action type ID:
  - 1 = Cost Change
  - 2 = Schedule Change
  - 3 = Client Contact
  - 5 = Note
  - 6 = Follow up
  - 7 = Reminder
  - 8 = General Change Order
- `DueDate` (string, required) - Due date (ISO 8601 format)
- `Status` (number, required) - Status code (1-9)
- `Source` (number, required) - Source code (1 = Manual)
- `CostChange` (object, optional) - Only for ActionTypeId=1
  - `Amount` (number, required)
  - `EstimateCategoryId` (string, required) - GUID
  - `RequiresClientApproval` (boolean, optional) - Default: true
- `ScheduleChange` (object, optional) - Only for ActionTypeId=2
  - `NoOfDays` (number, required)
  - `ConstructionTaskId` (string, required) - GUID
  - `RequiresClientApproval` (boolean, optional) - Default: true
- `SupervisorIds` (array of numbers, optional) - User IDs to assign
- `InitialComment` (string, optional) - Initial comment text

**Returns:** Complete action item with all nested data

---

## 7. Action Items - Comments (4 tools)

### `list_action_item_comments`
Get all comments for an action item

**Parameters:**
- `actionItemId` (number, required)

### `create_action_item_comment`
Add a comment to an action item

**Parameters:**
- `actionItemId` (number, required)
- `Comment` (string, required)

### `update_action_item_comment`
Update an existing comment

**Parameters:**
- `actionItemId` (number, required)
- `commentId` (number, required)
- `Comment` (string, required)

### `delete_action_item_comment`
Delete a comment from an action item

**Parameters:**
- `actionItemId` (number, required)
- `commentId` (number, required)

---

## 8. Action Items - Supervisors (3 tools)

### `list_action_item_supervisors`
Get all supervisors assigned to an action item

**Parameters:**
- `actionItemId` (number, required)

### `assign_action_item_supervisor`
Assign a supervisor to an action item

**Parameters:**
- `actionItemId` (number, required)
- `SupervisorId` (number, required) - User ID

### `remove_action_item_supervisor`
Remove a supervisor from an action item

**Parameters:**
- `actionItemId` (number, required)
- `supervisorAssignmentId` (string, required) - Assignment ID (GUID)

---

## 9. Action Items - Cost Changes (4 tools)

**Note:** Only applicable for ActionTypeId = 1 (Cost Change)

### `get_action_item_cost_change`
Get cost change data for an action item

**Parameters:**
- `actionItemId` (number, required)

**Returns:** Cost change with EstimateCategoryName populated

### `create_action_item_cost_change`
Add cost change data to an action item

**Parameters:**
- `actionItemId` (number, required)
- `Amount` (number, required)
- `EstimateCategoryId` (string, required) - GUID
- `RequiresClientApproval` (boolean, optional)

### `update_action_item_cost_change`
Update cost change data

**Parameters:**
- `actionItemId` (number, required)
- `Amount` (number, optional)
- `EstimateCategoryId` (string, optional) - GUID
- `RequiresClientApproval` (boolean, optional)

### `delete_action_item_cost_change`
Delete cost change data

**Parameters:**
- `actionItemId` (number, required)

---

## 10. Action Items - Schedule Changes (4 tools)

**Note:** Only applicable for ActionTypeId = 2 (Schedule Change)

### `get_action_item_schedule_change`
Get schedule change data for an action item

**Parameters:**
- `actionItemId` (number, required)

**Returns:** Schedule change with ConstructionTaskName populated

### `create_action_item_schedule_change`
Add schedule change data to an action item

**Parameters:**
- `actionItemId` (number, required)
- `NoOfDays` (number, required) - Number of days to adjust
- `ConstructionTaskId` (string, required) - GUID
- `RequiresClientApproval` (boolean, optional)

### `update_action_item_schedule_change`
Update schedule change data

**Parameters:**
- `actionItemId` (number, required)
- `NoOfDays` (number, optional)
- `ConstructionTaskId` (string, optional) - GUID
- `RequiresClientApproval` (boolean, optional)

### `delete_action_item_schedule_change`
Delete schedule change data

**Parameters:**
- `actionItemId` (number, required)

---

## 11. Project Resources (3 tools)

### `list_project_schedules`
Get paginated list of project schedules

**Parameters:**
- `page` (number, optional)
- `limit` (number, optional)

### `list_project_schedule_tasks`
Get project schedule tasks

**Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `scheduleId` (string, optional) - Filter by schedule ID

### `list_project_managements`
Get paginated list of project managements

**Parameters:**
- `page` (number, optional)
- `limit` (number, optional)

---

## 12. Transactions (2 tools) - TIER 2

### `list_transactions`
Get QB transaction history with filters for project, account, date range, and transaction type

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)
- `projectId` (string, optional) - Filter by project ID (GUID)
- `accountId` (string, optional) - Filter by account ID (GUID)
- `startDate` (string, optional) - Start date filter (ISO 8601 format)
- `endDate` (string, optional) - End date filter (ISO 8601 format)
- `transactionType` (string, optional) - Filter by transaction type (e.g., Bill, Check, Receipt)

**Status:** ⚠️ Database schema needs verification (QBTransactions table)

### `get_transaction_summary`
Get aggregated transaction summaries grouped by project, account, vendor, or month

**Parameters:**
- `groupBy` (string, required) - Group by: project, account, vendor, or month
- `projectId` (string, optional) - Filter by project ID (GUID)
- `startDate` (string, optional) - Start date filter (ISO 8601 format)
- `endDate` (string, optional) - End date filter (ISO 8601 format)

**Status:** ⚠️ Database schema needs verification (QBTransactions table)

---

## 13. Job Balances (1 tool) - TIER 2

### `list_job_balances`
Get job-level financial balances showing current balance, receivables, and collected amounts

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)
- `projectId` (string, optional) - Filter by specific project ID (GUID)

**Status:** ⚠️ Database schema needs verification (JobBalances table)

---

## 14. Cost Variance (1 tool) - TIER 2

### `get_cost_variance`
Calculate cost variance by comparing original/revised estimates against actual costs from transactions

**Parameters:**
- `projectId` (string, optional) - Filter by project ID (GUID)
- `categoryId` (string, optional) - Filter by estimate category ID (GUID)

**Status:** ⚠️ Requires projectId parameter (working as designed)

---

## 15. Invoices (2 tools) - TIER 2

### `list_invoices`
Get paginated list of invoices with filtering by client, status, and date range

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)
- `clientId` (string, optional) - Filter by client ID (GUID)
- `status` (string, optional) - Filter by status (e.g., Paid, Unpaid, Overdue)
- `startDate` (string, optional) - Start date filter (ISO 8601 format)
- `endDate` (string, optional) - End date filter (ISO 8601 format)

**Status:** ✅ Working

### `get_invoice`
Get a specific invoice by ID with all line items

**Parameters:**
- `id` (string, required) - Invoice ID (GUID)

**Status:** ✅ Working

---

## 16. Schedule Revisions (2 tools) - TIER 2

### `list_schedule_revisions`
Get schedule revision history showing how schedules have changed over time

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)
- `projectId` (string, optional) - Filter by project ID (GUID)

**Status:** ✅ Working

### `get_schedule_revision`
Get a specific schedule revision by ID with all revision items

**Parameters:**
- `id` (string, required) - Schedule revision ID (GUID)

**Status:** ✅ Working

---

## 17. Project Details (1 tool) - TIER 2

### `get_project_details`
Get comprehensive project overview combining schedule, financial status, team, and recent activity

**Parameters:**
- `id` (string, required) - Project ID (GUID)

**Status:** ⚠️ Needs testing with valid project ID

---

## 18. Proposal Pipeline (1 tool) - TIER 2

### `get_proposal_pipeline`
Get sales pipeline analytics including conversion rates, proposal status breakdown, and recent activity

**Parameters:**
- `startDate` (string, optional) - Start date filter (ISO 8601 format)
- `endDate` (string, optional) - End date filter (ISO 8601 format)

**Status:** ⚠️ Route needs fixing (validation error)

---

## 19. Estimate Revisions (1 tool) - TIER 2

### `get_estimate_revision_history`
Get estimate revision history showing how estimates changed and calculate average overage percentage

**Parameters:**
- `projectId` (string, optional) - Filter by project ID (GUID)

**Status:** ⚠️ Route needs fixing (validation error)

---

## 20. Cost Revisions (2 tools) - TIER 2

### `list_cost_revisions`
Get detailed cost revision history from the CostRevisions table

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)
- `projectId` (string, optional) - Filter by project ID (GUID)

**Status:** ✅ Working

### `get_cost_revision`
Get a specific cost revision by ID with all revision items

**Parameters:**
- `id` (string, required) - Cost revision ID (GUID)

**Status:** ✅ Working

---

## 21. Deposits (2 tools) - TIER 2

### `list_deposits`
Get deposit/retainer tracking with usage calculations and threshold alerts

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)
- `projectId` (string, optional) - Filter by project ID (GUID)

**Status:** ⚠️ Database schema needs verification

### `get_deposit_by_project`
Get deposit details for a specific project

**Parameters:**
- `projectId` (string, required) - Project ID (GUID)

**Status:** ⚠️ Database schema needs verification

---

## 22. Proposal Template Pricing (2 tools) - TIER 2

### `get_proposal_template_pricing`
Get standard pricing templates for estimates across all categories

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)

**Status:** ⚠️ Database schema needs verification (ProposalTemplates table)

### `get_proposal_template_pricing_by_id`
Get pricing template for a specific proposal template ID

**Parameters:**
- `id` (string, required) - Proposal template ID (GUID)

**Status:** ⚠️ Database schema needs verification (ProposalTemplates table)

---

## Summary by Category

| Category | Tools | Status |
|----------|-------|--------|
| **Base Tier** | | |
| Clients | 3 | ✅ |
| Contacts | 2 | ✅ |
| Subcontractors | 1 | ✅ |
| Proposals | 3 | ✅ |
| Estimates | 1 | ✅ |
| Action Items (Base) | 3 | ✅ |
| Action Items (Comments) | 4 | ✅ |
| Action Items (Supervisors) | 3 | ✅ |
| Action Items (Cost Changes) | 4 | ✅ |
| Action Items (Schedule Changes) | 4 | ✅ |
| Project Resources | 3 | ✅ |
| **Tier 2: Financial & Analytics** | | |
| Transactions | 2 | ⚠️ |
| Job Balances | 1 | ⚠️ |
| Cost Variance | 1 | ⚠️ |
| Invoices | 2 | ✅ |
| Schedule Revisions | 2 | ✅ |
| Project Details | 1 | ⚠️ |
| Proposal Pipeline | 1 | ⚠️ |
| Estimate Revisions | 1 | ⚠️ |
| Cost Revisions | 2 | ✅ |
| Deposits | 2 | ⚠️ |
| Proposal Template Pricing | 2 | ⚠️ |
| **Total** | **49** | **6/12 Working** |

---

## Configuration

The MCP server requires one configuration parameter:

- `JOEAPI_BASE_URL` (string, URL) - Base URL for JoeAPI server
  - Default: `http://localhost:8080`
  - Production: `https://joeapi.fly.dev`

---

## Usage with Smithery

The MCP server is deployed via Smithery and can be accessed by Claude and other AI assistants.

**Smithery Configuration** (`smithery.yaml`):
```yaml
runtime: "typescript"
env:
  JOEAPI_BASE_URL: "https://joeapi.fly.dev"
```

---

## Recent Changes

### v1.2.0 (2025-11-13) - Tier 2 Financial & Analytics

**Added 18 new tools across 11 categories:**

**Working (6 tools):**
- ✅ Invoices (2 tools) - list_invoices, get_invoice
- ✅ Schedule Revisions (2 tools) - list_schedule_revisions, get_schedule_revision
- ✅ Cost Revisions (2 tools) - list_cost_revisions, get_cost_revision

**Needs Schema Verification (6 tools):**
- ⚠️ Transactions (2 tools) - list_transactions, get_transaction_summary
- ⚠️ Job Balances (1 tool) - list_job_balances
- ⚠️ Deposits (2 tools) - list_deposits, get_deposit_by_project
- ⚠️ Proposal Template Pricing (2 tools) - get_proposal_template_pricing, get_proposal_template_pricing_by_id

**Needs Route Fixing (2 tools):**
- ⚠️ Proposal Pipeline (1 tool) - get_proposal_pipeline
- ⚠️ Estimate Revisions (1 tool) - get_estimate_revision_history

**Needs Testing (2 tools):**
- ⚠️ Cost Variance (1 tool) - get_cost_variance (requires projectId)
- ⚠️ Project Details (1 tool) - get_project_details (needs valid project ID)

### v1.1.0 (2025-11-13) - Action Items Enhancement

**Added 17 new tools:**
- 4 tools for action item comments (list, create, update, delete)
- 3 tools for action item supervisors (list, assign, remove)
- 4 tools for action item cost changes (get, create, update, delete)
- 4 tools for action item schedule changes (get, create, update, delete)
- Enhanced `create_action_item` to accept nested data
- Enhanced `get_action_item` to return all nested data

**Improved:**
- Removed all debug logging for production readiness
- Cleaner error handling
- Simplified HTTP helper function
- Better tool descriptions with type information

---

**Last Updated:** 2025-11-13
**API Base URL:** https://joeapi.fly.dev
**MCP Server Version:** 1.2.0
