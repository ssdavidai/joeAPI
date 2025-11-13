# JoeAPI MCP Tools Reference

**Version:** 1.1.0
**Total Tools:** 31

## Overview

The JoeAPI MCP Server exposes 31 tools for interacting with the construction management system. These tools are organized into 8 main categories.

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

## Summary by Category

| Category | Tools |
|----------|-------|
| Clients | 3 |
| Contacts | 2 |
| Subcontractors | 1 |
| Proposals | 3 |
| Estimates | 1 |
| Action Items (Base) | 3 |
| Action Items (Comments) | 4 |
| Action Items (Supervisors) | 3 |
| Action Items (Cost Changes) | 4 |
| Action Items (Schedule Changes) | 4 |
| Project Resources | 3 |
| **Total** | **31** |

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

## Recent Changes (v1.1.0)

### Added (17 new tools)
- 4 tools for action item comments (list, create, update, delete)
- 3 tools for action item supervisors (list, assign, remove)
- 4 tools for action item cost changes (get, create, update, delete)
- 4 tools for action item schedule changes (get, create, update, delete)
- Enhanced `create_action_item` to accept nested data
- Enhanced `get_action_item` to return all nested data

### Improved
- Removed all debug logging for production readiness
- Cleaner error handling
- Simplified HTTP helper function
- Better tool descriptions with type information

---

**Last Updated:** 2025-11-13
**API Base URL:** https://joeapi.fly.dev
**MCP Server Version:** 1.1.0
