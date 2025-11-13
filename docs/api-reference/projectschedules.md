# ProjectSchedules API Reference

## Table Schema

### Database Table: `dbo.[ProjectSchedules]`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
| Id | uniqueidentifier | N/A | NO | YES | NULL |
| ProjectId | uniqueidentifier | N/A | YES | NO | NULL |
| Status | varchar | 50 | YES | NO | NULL |
| StartDate | date | N/A | NO | NO | NULL |
| CreatedBy | int | N/A | NO | NO | NULL |
| UpdatedBy | int | N/A | YES | NO | NULL |
| DateCreated | datetime | N/A | NO | NO | NULL |
| DateUpdated | datetime | N/A | YES | NO | NULL |

---

## API Endpoints

### Base URL
```
https://joeapi.fly.dev/api/v1/projectschedules
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## 1. List ProjectSchedules

**GET** `/api/v1/projectschedules`

### Description
Retrieve a paginated list of projectschedules.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `search` | string | - | Search term (optional) |


### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/projectschedules?page=1&limit=20" \
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
  "ProjectId": null,
  "Status": null,
  "StartDate": null,
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

## 2. Get ProjectSchedule by ID

**GET** `/api/v1/projectschedules/:id`

### Description
Retrieve a single projectschedule by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProjectSchedule ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/projectschedules/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ProjectId": null,
  "Status": null,
  "StartDate": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 3. Create ProjectSchedule

**POST** `/api/v1/projectschedules`

### Description
Create a new projectschedule.

### Request Body

#### Required Fields:
- `StartDate` (date)

#### Optional Fields:
- `ProjectId` (uniqueidentifier)
- `Status` (varchar, max 50)

### Example Request
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/projectschedules" \
  -H "Content-Type: application/json" \
  -d '{
  "ProjectId": null
}'
```

### Example Response
```json
{
  "success": true,
  "message": "ProjectSchedule created successfully",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ProjectId": null,
  "Status": null,
  "StartDate": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 4. Update ProjectSchedule

**PUT** `/api/v1/projectschedules/:id`

### Description
Update an existing projectschedule.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProjectSchedule ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/projectschedules/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Example Response
```json
{
  "success": true,
  "message": "ProjectSchedule updated successfully",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "ProjectId": null,
  "Status": null,
  "StartDate": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 5. Delete ProjectSchedule

**DELETE** `/api/v1/projectschedules/:id`

### Description
Delete a projectschedule (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProjectSchedule ID |

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/projectschedules/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "ProjectSchedule deleted successfully",
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
  "message": "ProjectSchedule not found",
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

### ProjectId
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Related project ID (GUID)

### Status
- **Type:** varchar (max length: 50)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Status code (integer)

### StartDate
- **Type:** date
- **Nullable:** NO
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

**Generated:** 2025-11-13T06:33:19.926Z
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
