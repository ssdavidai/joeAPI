# ProjectManagements API Reference

## Table Schema

### Database Table: `dbo.[ProjectManagements]`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
| ProjectManagementID | uniqueidentifier | N/A | NO | YES | NULL |
| QBClassID | uniqueidentifier | N/A | NO | NO | NULL |
| ConstructionTaskID | uniqueidentifier | N/A | NO | NO | NULL |
| StartDate | datetime2 | N/A | YES | NO | NULL |
| EndDate | datetime2 | N/A | YES | NO | NULL |
| Status | nvarchar | 50 | NO | NO | NULL |
| AssignedTo | uniqueidentifier | N/A | YES | NO | NULL |
| Pred1ID | uniqueidentifier | N/A | YES | NO | NULL |
| Pred1LagID | uniqueidentifier | N/A | YES | NO | NULL |
| Pred2ID | uniqueidentifier | N/A | YES | NO | NULL |
| Pred2LagID | uniqueidentifier | N/A | YES | NO | NULL |
| Pred3ID | uniqueidentifier | N/A | YES | NO | NULL |
| Pred3LagID | uniqueidentifier | N/A | YES | NO | NULL |
| ProgressPercentage | decimal | N/A | NO | NO | NULL |
| Notes | nvarchar | -1 | NO | NO | NULL |
| Description | nvarchar | -1 | NO | NO | NULL |

---

## API Endpoints

### Base URL
```
https://joeapi.fly.dev/api/v1/projectmanagements
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## 1. List ProjectManagements

**GET** `/api/v1/projectmanagements`

### Description
Retrieve a paginated list of projectmanagements.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `search` | string | - | Search term (optional) |


### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/projectmanagements?page=1&limit=20" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
  "ProjectManagementID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "QBClassID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ConstructionTaskID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "StartDate": "2025-11-13T00:00:00.000Z",
  "EndDate": "2025-11-13T00:00:00.000Z",
  "Status": "Sample value",
  "AssignedTo": null,
  "Pred1ID": null,
  "Pred1LagID": null,
  "Pred2ID": null,
  "Pred2LagID": null,
  "Pred3ID": null,
  "Pred3LagID": null,
  "ProgressPercentage": 1500,
  "Notes": "Sample value",
  "Description": "Sample description"
}
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 2. Get ProjectManagement by ID

**GET** `/api/v1/projectmanagements/:id`

### Description
Retrieve a single projectmanagement by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProjectManagement ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/projectmanagements/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
  "ProjectManagementID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "QBClassID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ConstructionTaskID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "StartDate": "2025-11-13T00:00:00.000Z",
  "EndDate": "2025-11-13T00:00:00.000Z",
  "Status": "Sample value",
  "AssignedTo": null,
  "Pred1ID": null,
  "Pred1LagID": null,
  "Pred2ID": null,
  "Pred2LagID": null,
  "Pred3ID": null,
  "Pred3LagID": null,
  "ProgressPercentage": 1500,
  "Notes": "Sample value",
  "Description": "Sample description"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 3. Create ProjectManagement

**POST** `/api/v1/projectmanagements`

### Description
Create a new projectmanagement.

### Request Body

#### Required Fields:
- `QBClassID` (uniqueidentifier)
- `ConstructionTaskID` (uniqueidentifier)
- `Status` (nvarchar, max 50)
- `ProgressPercentage` (decimal)
- `Notes` (nvarchar, max -1)
- `Description` (nvarchar, max -1)

#### Optional Fields:
- `StartDate` (datetime2)
- `EndDate` (datetime2)
- `AssignedTo` (uniqueidentifier)
- `Pred1ID` (uniqueidentifier)
- `Pred1LagID` (uniqueidentifier)
- `Pred2ID` (uniqueidentifier)
- `Pred2LagID` (uniqueidentifier)
- `Pred3ID` (uniqueidentifier)
- `Pred3LagID` (uniqueidentifier)

### Example Request
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/projectmanagements" \
  -H "Content-Type: application/json" \
  -d '{
  "ProjectManagementID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Status": "Sample value",
  "Notes": "Sample value",
  "Description": "Sample description"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "ProjectManagement created successfully",
  "data": {
  "ProjectManagementID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "QBClassID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ConstructionTaskID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "StartDate": "2025-11-13T00:00:00.000Z",
  "EndDate": "2025-11-13T00:00:00.000Z",
  "Status": "Sample value",
  "AssignedTo": null,
  "Pred1ID": null,
  "Pred1LagID": null,
  "Pred2ID": null,
  "Pred2LagID": null,
  "Pred3ID": null,
  "Pred3LagID": null,
  "ProgressPercentage": 1500,
  "Notes": "Sample value",
  "Description": "Sample description"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 4. Update ProjectManagement

**PUT** `/api/v1/projectmanagements/:id`

### Description
Update an existing projectmanagement.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProjectManagement ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/projectmanagements/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json" \
  -d '{
  "Description": "Updated description"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "ProjectManagement updated successfully",
  "data": {
  "ProjectManagementID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "QBClassID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ConstructionTaskID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "StartDate": "2025-11-13T00:00:00.000Z",
  "EndDate": "2025-11-13T00:00:00.000Z",
  "Status": "Sample value",
  "AssignedTo": null,
  "Pred1ID": null,
  "Pred1LagID": null,
  "Pred2ID": null,
  "Pred2LagID": null,
  "Pred3ID": null,
  "Pred3LagID": null,
  "ProgressPercentage": 1500,
  "Notes": "Sample value",
  "Description": "Sample description"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 5. Delete ProjectManagement

**DELETE** `/api/v1/projectmanagements/:id`

### Description
Delete a projectmanagement (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProjectManagement ID |

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/projectmanagements/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "ProjectManagement deleted successfully",
  "data": null,
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "timestamp": "2025-11-13T00:00:00.000Z",
  "errors": [
    {
      "field": "FieldName",
      "message": "Error message"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No authorization header provided",
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "ProjectManagement not found",
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## Field Descriptions

### ProjectManagementID
- **Type:** uniqueidentifier
- **Nullable:** NO
- **Primary Key:** YES



### QBClassID
- **Type:** uniqueidentifier
- **Nullable:** NO
- **Primary Key:** NO



### ConstructionTaskID
- **Type:** uniqueidentifier
- **Nullable:** NO
- **Primary Key:** NO



### StartDate
- **Type:** datetime2
- **Nullable:** YES
- **Primary Key:** NO



### EndDate
- **Type:** datetime2
- **Nullable:** YES
- **Primary Key:** NO



### Status
- **Type:** nvarchar (max length: 50)
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Status code (integer)

### AssignedTo
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### Pred1ID
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### Pred1LagID
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### Pred2ID
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### Pred2LagID
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### Pred3ID
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### Pred3LagID
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### ProgressPercentage
- **Type:** decimal
- **Nullable:** NO
- **Primary Key:** NO



### Notes
- **Type:** nvarchar (max length: -1)
- **Nullable:** NO
- **Primary Key:** NO



### Description
- **Type:** nvarchar (max length: -1)
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Detailed description

---

**Generated:** 2025-11-13T06:33:20.394Z
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
