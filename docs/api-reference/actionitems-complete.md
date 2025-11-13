# ActionItems Complete API Reference

## Overview

The ActionItems API provides comprehensive management of action items with support for:
- **Base action items** (CRUD operations)
- **Comments** - Discussion threads on action items
- **Supervisors** - Team member assignments
- **Cost Changes** - Financial impact tracking (ActionTypeId = 1)
- **Schedule Changes** - Timeline impact tracking (ActionTypeId = 2)

### Base URL
```
https://joeapi.fly.dev/api/v1/actionitems
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## Action Item Types

| ID | Type | Description |
|----|------|-------------|
| 1 | Cost Change | Track financial changes with amount and budget category |
| 2 | Schedule Change | Track timeline changes with days and construction task |
| 3 | Client Contact | General client communication |
| 5 | Note | General notes and observations |
| 6 | Follow up | Follow-up items for sub-contractors, clients, city, etc. |
| 7 | Reminder | Alarms, notifications, text/email reminders |
| 8 | General Change Order | General change orders |

## Action Item Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 1 | Open | New action item |
| 2 | In Progress | Currently being worked on |
| 4 | Pending | Waiting for something |
| 5 | On Hold | Temporarily paused |
| 6 | Completed | Finished |
| 7 | Cancelled | Cancelled |
| 8 | Reviewed | Under review |
| 9 | Approved | Approved |

---

# Base ActionItems Endpoints

## 1. List ActionItems

**GET** `/api/v1/actionitems`

Retrieve a paginated list of action items with optional filtering.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `projectId` | GUID | - | Filter by project ID |
| `includeDeleted` | boolean | false | Include soft-deleted items |
| `includeArchived` | boolean | false | Include archived items |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/actionitems?page=1&limit=20&projectId=abc-123" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "Id": 456,
      "Title": "Additional drywall work in master bedroom",
      "Description": "Client requested additional closet built-in...",
      "ProjectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "ActionTypeId": 1,
      "DueDate": "2025-12-15",
      "Status": 1,
      "Source": 1,
      "IsArchived": false,
      "AcceptedBy": null,
      "IsDeleted": false,
      "DateCreated": "2025-11-13T12:00:00.000Z",
      "CreatedBy": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 2. Get ActionItem by ID

**GET** `/api/v1/actionitems/:id`

Retrieve a single action item with all related data (comments, supervisors, cost/schedule changes).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Action item ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/actionitems/456" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "data": {
    "Id": 456,
    "Title": "Additional drywall work in master bedroom",
    "Description": "Client requested additional closet built-in...",
    "ProjectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "ActionTypeId": 1,
    "DueDate": "2025-12-15",
    "Status": 1,
    "Source": 1,
    "IsArchived": false,
    "AcceptedBy": null,
    "IsDeleted": false,
    "DateCreated": "2025-11-13T12:00:00.000Z",
    "CreatedBy": 1,
    "CostChange": {
      "Id": 53,
      "ActionItemId": 456,
      "Amount": 1250.00,
      "EstimateCategoryId": "E4349FCC-47B1-4149-BEE6-018089B9ABB4",
      "EstimateCategoryName": "Drywall",
      "RequiresClientApproval": true
    },
    "ScheduleChange": null,
    "Comments": [
      {
        "Id": 16,
        "ActionItemId": 456,
        "Comment": "Discussed with client on-site today",
        "DateCreated": "2025-11-13T12:00:00.000Z",
        "CreatedBy": 1
      }
    ],
    "Supervisors": [
      {
        "Id": "abc-123",
        "ActionItemId": 456,
        "SupervisorId": 83,
        "DateCreated": "2025-11-13T12:00:00.000Z",
        "CreatedBy": 1
      }
    ]
  }
}
```

---

## 3. Create ActionItem

**POST** `/api/v1/actionitems`

Create a new action item with optional nested data for cost change, schedule change, supervisors, and initial comment.

### Request Body

#### Required Fields:
- `Title` (string) - Action item title
- `Description` (string) - Detailed description
- `ActionTypeId` (integer) - Type of action (1-8)
- `DueDate` (string) - ISO 8601 date
- `Status` (integer) - Status code (1-9)
- `Source` (integer) - Source code (1 = Manual)

#### Optional Fields:
- `ProjectId` (GUID) - Related project
- `IsArchived` (boolean) - Archive flag (default: false)
- `AcceptedBy` (integer) - User ID who accepted
- `CostChange` (object) - Cost change data (only for ActionTypeId=1)
  - `Amount` (number) - Cost change amount
  - `EstimateCategoryId` (GUID) - Budget category
  - `RequiresClientApproval` (boolean) - Default: true
- `ScheduleChange` (object) - Schedule change data (only for ActionTypeId=2)
  - `NoOfDays` (integer) - Days to adjust
  - `ConstructionTaskId` (GUID) - Task to adjust
  - `RequiresClientApproval` (boolean) - Default: true
- `SupervisorIds` (array of integers) - Supervisors to assign
- `InitialComment` (string) - Initial comment text

### Example Request: Simple Note
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/actionitems" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Check on cabinet delivery",
    "Description": "Follow up with supplier on cabinet delivery timeline",
    "ActionTypeId": 5,
    "DueDate": "2025-12-01",
    "Status": 1,
    "Source": 1
  }'
```

### Example Request: Cost Change with Full Nested Data
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/actionitems" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Additional drywall work in master bedroom",
    "Description": "Client requested additional closet built-in requiring 150 sq ft of drywall. Labor: $800, Materials: $450",
    "ProjectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "ActionTypeId": 1,
    "DueDate": "2025-12-15",
    "Status": 1,
    "Source": 1,
    "CostChange": {
      "Amount": 1250.00,
      "EstimateCategoryId": "E4349FCC-47B1-4149-BEE6-018089B9ABB4",
      "RequiresClientApproval": true
    },
    "SupervisorIds": [83, 5],
    "InitialComment": "Discussed with client on-site today. They approved verbally."
  }'
```

### Example Request: Schedule Change
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/actionitems" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Delay in window installation due to supplier backorder",
    "Description": "Window supplier has 3-week backorder. Need to push Windows - Install task by 21 days",
    "ProjectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "ActionTypeId": 2,
    "DueDate": "2025-12-10",
    "Status": 1,
    "Source": 1,
    "ScheduleChange": {
      "NoOfDays": 21,
      "ConstructionTaskId": "9523E1B2-0916-45E2-AB4C-0C4395AB2EFC",
      "RequiresClientApproval": true
    },
    "SupervisorIds": [43]
  }'
```

### Example Response
Returns the complete action item with all nested data (same format as GET by ID).

---

## 4. Update ActionItem

**PUT** `/api/v1/actionitems/:id`

Update an existing action item's base fields. Use separate endpoints to update nested data.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Action item ID |

### Request Body
Any updateable fields (all optional):
- `Title`, `Description`, `ProjectId`, `ActionTypeId`, `DueDate`, `Status`, `Source`, `IsArchived`, `AcceptedBy`

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/actionitems/456" \
  -H "Content-Type: application/json" \
  -d '{
    "Status": 6,
    "AcceptedBy": 83
  }'
```

---

## 5. Delete ActionItem

**DELETE** `/api/v1/actionitems/:id`

Soft delete an action item (sets IsDeleted flag).

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/actionitems/456" \
  -H "Content-Type: application/json"
```

---

# Comments Endpoints

## List Comments

**GET** `/api/v1/actionitems/:actionItemId/comments`

Get all comments for an action item.

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/actionitems/456/comments" \
  -H "Content-Type: application/json"
```

---

## Create Comment

**POST** `/api/v1/actionitems/:actionItemId/comments`

Add a comment to an action item.

### Request Body
```json
{
  "Comment": "Client approved the change order"
}
```

---

## Update Comment

**PUT** `/api/v1/actionitems/:actionItemId/comments/:commentId`

Update an existing comment.

### Request Body
```json
{
  "Comment": "Updated comment text"
}
```

---

## Delete Comment

**DELETE** `/api/v1/actionitems/:actionItemId/comments/:commentId`

Delete a comment.

---

# Supervisors Endpoints

## List Supervisors

**GET** `/api/v1/actionitems/:actionItemId/supervisors`

Get all supervisors assigned to an action item.

---

## Assign Supervisor

**POST** `/api/v1/actionitems/:actionItemId/supervisors`

Assign a supervisor to an action item.

### Request Body
```json
{
  "SupervisorId": 83
}
```

---

## Remove Supervisor

**DELETE** `/api/v1/actionitems/:actionItemId/supervisors/:supervisorAssignmentId`

Remove a supervisor from an action item.

---

# Cost Change Endpoints

*Only applicable for ActionTypeId = 1 (Cost Change)*

## Get Cost Change

**GET** `/api/v1/actionitems/:actionItemId/costchange`

Get cost change data for an action item.

---

## Create Cost Change

**POST** `/api/v1/actionitems/:actionItemId/costchange`

Add cost change data to an action item.

### Request Body
```json
{
  "Amount": 1250.00,
  "EstimateCategoryId": "E4349FCC-47B1-4149-BEE6-018089B9ABB4",
  "RequiresClientApproval": true
}
```

---

## Update Cost Change

**PUT** `/api/v1/actionitems/:actionItemId/costchange`

Update cost change data.

### Request Body (all fields optional)
```json
{
  "Amount": 1500.00,
  "EstimateCategoryId": "E4349FCC-47B1-4149-BEE6-018089B9ABB4",
  "RequiresClientApproval": false
}
```

---

## Delete Cost Change

**DELETE** `/api/v1/actionitems/:actionItemId/costchange`

Delete cost change data.

---

# Schedule Change Endpoints

*Only applicable for ActionTypeId = 2 (Schedule Change)*

## Get Schedule Change

**GET** `/api/v1/actionitems/:actionItemId/schedulechange`

Get schedule change data for an action item.

---

## Create Schedule Change

**POST** `/api/v1/actionitems/:actionItemId/schedulechange`

Add schedule change data to an action item.

### Request Body
```json
{
  "NoOfDays": 21,
  "ConstructionTaskId": "9523E1B2-0916-45E2-AB4C-0C4395AB2EFC",
  "RequiresClientApproval": true
}
```

---

## Update Schedule Change

**PUT** `/api/v1/actionitems/:actionItemId/schedulechange`

Update schedule change data.

### Request Body (all fields optional)
```json
{
  "NoOfDays": 14,
  "RequiresClientApproval": false
}
```

---

## Delete Schedule Change

**DELETE** `/api/v1/actionitems/:actionItemId/schedulechange`

Delete schedule change data.

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "ActionTypeId",
      "message": "ActionTypeId is required"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "ActionItem not found"
}
```

### 400 Bad Request - Business Logic Error
```json
{
  "success": false,
  "message": "Cost change already exists for this action item. Use PUT to update."
}
```

---

**Generated:** 2025-11-13
**API Version:** 1.1.0
**Base URL:** https://joeapi.fly.dev
