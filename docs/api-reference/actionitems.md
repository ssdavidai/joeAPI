# ActionItems API Reference

## Table Schema

### Database Table: `dbo.[ActionItems]`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
| Id | int | N/A | NO | YES | NULL |
| Title | nvarchar | -1 | NO | NO | NULL |
| Description | nvarchar | -1 | NO | NO | NULL |
| ProjectId | uniqueidentifier | N/A | YES | NO | NULL |
| ActionTypeId | int | N/A | NO | NO | NULL |
| DateCreated | datetime2 | N/A | NO | NO | NULL |
| CreatedBy | int | N/A | NO | NO | NULL |
| DateUpdated | datetime2 | N/A | YES | NO | NULL |
| UpdatedBy | int | N/A | YES | NO | NULL |
| IsDeleted | bit | N/A | NO | NO | NULL |
| DueDate | date | N/A | NO | NO | ('0001-01-01') |
| Status | int | N/A | NO | NO | ((1)) |
| IsArchived | bit | N/A | NO | NO | ((0)) |
| AcceptedBy | int | N/A | YES | NO | NULL |
| Source | int | N/A | NO | NO | ((1)) |

---

## API Endpoints

### Base URL
```
https://joeapi.fly.dev/api/v1/actionitems
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## 1. List ActionItems

**GET** `/api/v1/actionitems`

### Description
Retrieve a paginated list of actionitems.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `search` | string | - | Search term (optional) |
| `projectId` | GUID | - | Filter by project ID |
| `includeDeleted` | boolean | false | Include soft-deleted items |
| `includeArchived` | boolean | false | Include archived items |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/actionitems?page=1&limit=20" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
  "Id": 1,
  "Title": "Sample Title",
  "Description": "Sample description",
  "ProjectId": null,
  "ActionTypeId": 1,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null,
  "IsDeleted": false,
  "DueDate": null,
  "Status": 1,
  "IsArchived": false,
  "AcceptedBy": null,
  "Source": 1
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

## 2. Get ActionItem by ID

**GET** `/api/v1/actionitems/:id`

### Description
Retrieve a single actionitem by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | ActionItem ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/actionitems/123" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
  "Id": 1,
  "Title": "Sample Title",
  "Description": "Sample description",
  "ProjectId": null,
  "ActionTypeId": 1,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null,
  "IsDeleted": false,
  "DueDate": null,
  "Status": 1,
  "IsArchived": false,
  "AcceptedBy": null,
  "Source": 1
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 3. Create ActionItem

**POST** `/api/v1/actionitems`

### Description
Create a new actionitem.

### Request Body

#### Required Fields:
- `Title` (nvarchar, max -1)
- `Description` (nvarchar, max -1)
- `ActionTypeId` (int)
- `DueDate` (date)
- `Status` (int)
- `IsArchived` (bit)
- `Source` (int)

#### Optional Fields:
- `ProjectId` (uniqueidentifier)

### Example Request
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/actionitems" \
  -H "Content-Type: application/json" \
  -d '{
  "Title": "Sample Title",
  "Description": "Sample description",
  "ProjectId": null,
  "ActionTypeId": 5,
  "Status": 1,
  "IsArchived": false,
  "Source": 1
}'
```

### Example Response
```json
{
  "success": true,
  "message": "ActionItem created successfully",
  "data": {
  "Id": 1,
  "Title": "Sample Title",
  "Description": "Sample description",
  "ProjectId": null,
  "ActionTypeId": 1,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null,
  "IsDeleted": false,
  "DueDate": null,
  "Status": 1,
  "IsArchived": false,
  "AcceptedBy": null,
  "Source": 1
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 4. Update ActionItem

**PUT** `/api/v1/actionitems/:id`

### Description
Update an existing actionitem.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | ActionItem ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/actionitems/123" \
  -H "Content-Type: application/json" \
  -d '{
  "Title": "Updated Title",
  "Description": "Updated description"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "ActionItem updated successfully",
  "data": {
  "Id": 1,
  "Title": "Sample Title",
  "Description": "Sample description",
  "ProjectId": null,
  "ActionTypeId": 1,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null,
  "IsDeleted": false,
  "DueDate": null,
  "Status": 1,
  "IsArchived": false,
  "AcceptedBy": null,
  "Source": 1
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 5. Delete ActionItem

**DELETE** `/api/v1/actionitems/:id`

### Description
Delete a actionitem (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | ActionItem ID |

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/actionitems/123" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "ActionItem deleted successfully",
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
  "message": "ActionItem not found",
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
- **Type:** int
- **Nullable:** NO
- **Primary Key:** YES

- **Description:** Unique identifier for this record

### Title
- **Type:** nvarchar (max length: -1)
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Title or heading

### Description
- **Type:** nvarchar (max length: -1)
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Detailed description

### ProjectId
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Related project ID (GUID)

### ActionTypeId
- **Type:** int
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Type of action (integer)

### DateCreated
- **Type:** datetime2
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Auto-generated creation timestamp

### CreatedBy
- **Type:** int
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** User ID who created this record

### DateUpdated
- **Type:** datetime2
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Auto-generated update timestamp

### UpdatedBy
- **Type:** int
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** User ID who last updated this record

### IsDeleted
- **Type:** bit
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Soft delete flag

### DueDate
- **Type:** date
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** ('0001-01-01')
- **Description:** Due date in ISO 8601 format

### Status
- **Type:** int
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** ((1))
- **Description:** Status code (integer)

### IsArchived
- **Type:** bit
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** ((0))
- **Description:** Archive flag

### AcceptedBy
- **Type:** int
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** User ID who accepted this item

### Source
- **Type:** int
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** ((1))
- **Description:** Source code (integer)

---

**Generated:** 2025-11-13T06:33:19.710Z
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
