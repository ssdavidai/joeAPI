# ProjectScheduleTasks API Reference

## Table Schema

### Database Table: `dbo.[ProjectScheduleTasks]`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
| Id | uniqueidentifier | N/A | NO | YES | NULL |
| ProjectScheduleId | uniqueidentifier | N/A | NO | NO | NULL |
| ConstructionTaskId | uniqueidentifier | N/A | NO | NO | NULL |
| Name | nvarchar | 150 | NO | NO | NULL |
| Sequence | int | N/A | NO | NO | NULL |
| Duration | int | N/A | NO | NO | NULL |
| StartDate | date | N/A | NO | NO | NULL |
| EndDate | date | N/A | NO | NO | NULL |
| Pred1 | uniqueidentifier | N/A | YES | NO | NULL |
| Lag1 | int | N/A | YES | NO | NULL |
| Pred2 | uniqueidentifier | N/A | YES | NO | NULL |
| Lag2 | int | N/A | YES | NO | NULL |
| Pred3 | uniqueidentifier | N/A | YES | NO | NULL |
| Lag3 | int | N/A | YES | NO | NULL |
| CreatedBy | int | N/A | NO | NO | NULL |
| UpdatedBy | int | N/A | YES | NO | NULL |
| DateCreated | datetime | N/A | NO | NO | NULL |
| DateUpdated | datetime | N/A | YES | NO | NULL |

---

## API Endpoints

### Base URL
```
https://joeapi.fly.dev/api/v1/projectscheduletasks
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## 1. List ProjectScheduleTasks

**GET** `/api/v1/projectscheduletasks`

### Description
Retrieve a paginated list of projectscheduletasks.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `search` | string | - | Search term (optional) |
| `scheduleId` | GUID | - | Filter by schedule ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/projectscheduletasks?page=1&limit=20" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ProjectScheduleId": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ConstructionTaskId": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": "Sample Name",
  "Sequence": 100,
  "Duration": 100,
  "StartDate": null,
  "EndDate": null,
  "Pred1": null,
  "Lag1": null,
  "Pred2": null,
  "Lag2": null,
  "Pred3": null,
  "Lag3": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z"
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

## 2. Get ProjectScheduleTask by ID

**GET** `/api/v1/projectscheduletasks/:id`

### Description
Retrieve a single projectscheduletask by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProjectScheduleTask ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/projectscheduletasks/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ProjectScheduleId": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ConstructionTaskId": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": "Sample Name",
  "Sequence": 100,
  "Duration": 100,
  "StartDate": null,
  "EndDate": null,
  "Pred1": null,
  "Lag1": null,
  "Pred2": null,
  "Lag2": null,
  "Pred3": null,
  "Lag3": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 3. Create ProjectScheduleTask

**POST** `/api/v1/projectscheduletasks`

### Description
Create a new projectscheduletask.

### Request Body

#### Required Fields:
- `ProjectScheduleId` (uniqueidentifier)
- `ConstructionTaskId` (uniqueidentifier)
- `Name` (nvarchar, max 150)
- `Sequence` (int)
- `Duration` (int)
- `StartDate` (date)
- `EndDate` (date)

#### Optional Fields:
- `Pred1` (uniqueidentifier)
- `Lag1` (int)
- `Pred2` (uniqueidentifier)
- `Lag2` (int)
- `Pred3` (uniqueidentifier)
- `Lag3` (int)

### Example Request
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/projectscheduletasks" \
  -H "Content-Type: application/json" \
  -d '{
  "ProjectScheduleId": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": "New ProjectScheduleTask",
  "Sequence": 1,
  "Duration": 1
}'
```

### Example Response
```json
{
  "success": true,
  "message": "ProjectScheduleTask created successfully",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ProjectScheduleId": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ConstructionTaskId": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": "Sample Name",
  "Sequence": 100,
  "Duration": 100,
  "StartDate": null,
  "EndDate": null,
  "Pred1": null,
  "Lag1": null,
  "Pred2": null,
  "Lag2": null,
  "Pred3": null,
  "Lag3": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 4. Update ProjectScheduleTask

**PUT** `/api/v1/projectscheduletasks/:id`

### Description
Update an existing projectscheduletask.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProjectScheduleTask ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/projectscheduletasks/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json" \
  -d '{
  "Name": "Updated Name"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "ProjectScheduleTask updated successfully",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ProjectScheduleId": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ConstructionTaskId": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": "Sample Name",
  "Sequence": 100,
  "Duration": 100,
  "StartDate": null,
  "EndDate": null,
  "Pred1": null,
  "Lag1": null,
  "Pred2": null,
  "Lag2": null,
  "Pred3": null,
  "Lag3": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 5. Delete ProjectScheduleTask

**DELETE** `/api/v1/projectscheduletasks/:id`

### Description
Delete a projectscheduletask (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProjectScheduleTask ID |

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/projectscheduletasks/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "ProjectScheduleTask deleted successfully",
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
  "message": "ProjectScheduleTask not found",
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

### Id
- **Type:** uniqueidentifier
- **Nullable:** NO
- **Primary Key:** YES

- **Description:** Unique identifier for this record

### ProjectScheduleId
- **Type:** uniqueidentifier
- **Nullable:** NO
- **Primary Key:** NO



### ConstructionTaskId
- **Type:** uniqueidentifier
- **Nullable:** NO
- **Primary Key:** NO



### Name
- **Type:** nvarchar (max length: 150)
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Display name

### Sequence
- **Type:** int
- **Nullable:** NO
- **Primary Key:** NO



### Duration
- **Type:** int
- **Nullable:** NO
- **Primary Key:** NO



### StartDate
- **Type:** date
- **Nullable:** NO
- **Primary Key:** NO



### EndDate
- **Type:** date
- **Nullable:** NO
- **Primary Key:** NO



### Pred1
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### Lag1
- **Type:** int
- **Nullable:** YES
- **Primary Key:** NO



### Pred2
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### Lag2
- **Type:** int
- **Nullable:** YES
- **Primary Key:** NO



### Pred3
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### Lag3
- **Type:** int
- **Nullable:** YES
- **Primary Key:** NO



### CreatedBy
- **Type:** int
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** User ID who created this record

### UpdatedBy
- **Type:** int
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** User ID who last updated this record

### DateCreated
- **Type:** datetime
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Auto-generated creation timestamp

### DateUpdated
- **Type:** datetime
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Auto-generated update timestamp

---

**Generated:** 2025-11-13T06:33:20.163Z
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
