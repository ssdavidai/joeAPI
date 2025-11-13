# ProposalLines API Reference

## Table Schema

### Database Table: `dbo.[ProposalLines]`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
| ID | uniqueidentifier | N/A | NO | YES | NULL |
| Name | nvarchar | 200 | YES | NO | NULL |
| Description | nvarchar | -1 | YES | NO | NULL |
| Amount | decimal | N/A | NO | NO | NULL |
| ProposalID | uniqueidentifier | N/A | NO | NO | NULL |
| EstimateCategoryID | uniqueidentifier | N/A | NO | NO | NULL |
| Created | datetime2 | N/A | YES | NO | NULL |
| CreatedBy | nvarchar | -1 | YES | NO | NULL |
| Updated | datetime2 | N/A | YES | NO | NULL |
| UpdatedBy | nvarchar | -1 | YES | NO | NULL |
| ParentEstimateCategoryID | uniqueidentifier | N/A | YES | NO | NULL |
| SqFoot | decimal | N/A | YES | NO | NULL |
| Multiplier | decimal | N/A | YES | NO | NULL |
| Percentage | float | N/A | YES | NO | NULL |
| Sequence | int | N/A | YES | NO | NULL |
| SqFootLocked | bit | N/A | NO | NO | ((0)) |

---

## API Endpoints

### Base URL
```
https://joeapi.fly.dev/api/v1/proposallines
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## 1. List ProposalLines

**GET** `/api/v1/proposallines`

### Description
Retrieve a paginated list of proposallines.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `search` | string | - | Search term (optional) |
| `proposalId` | GUID | - | Filter by proposal ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/proposallines?page=1&limit=20" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
  "ID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": null,
  "Description": null,
  "Amount": 1500,
  "ProposalID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "EstimateCategoryID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Created": null,
  "CreatedBy": null,
  "Updated": null,
  "UpdatedBy": null,
  "ParentEstimateCategoryID": null,
  "SqFoot": null,
  "Multiplier": null,
  "Percentage": null,
  "Sequence": null,
  "SqFootLocked": false
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

## 2. Get ProposalLine by ID

**GET** `/api/v1/proposallines/:id`

### Description
Retrieve a single proposalline by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProposalLine ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/proposallines/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
  "ID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": null,
  "Description": null,
  "Amount": 1500,
  "ProposalID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "EstimateCategoryID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Created": null,
  "CreatedBy": null,
  "Updated": null,
  "UpdatedBy": null,
  "ParentEstimateCategoryID": null,
  "SqFoot": null,
  "Multiplier": null,
  "Percentage": null,
  "Sequence": null,
  "SqFootLocked": false
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 3. Create ProposalLine

**POST** `/api/v1/proposallines`

### Description
Create a new proposalline.

### Request Body

#### Required Fields:
- `Amount` (decimal)
- `ProposalID` (uniqueidentifier)
- `EstimateCategoryID` (uniqueidentifier)
- `SqFootLocked` (bit)

#### Optional Fields:
- `Name` (nvarchar, max 200)
- `Description` (nvarchar, max -1)
- `Created` (datetime2)
- `Updated` (datetime2)
- `ParentEstimateCategoryID` (uniqueidentifier)
- `SqFoot` (decimal)
- `Multiplier` (decimal)
- `Percentage` (float)
- `Sequence` (int)

### Example Request
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/proposallines" \
  -H "Content-Type: application/json" \
  -d '{
  "Amount": 2500
}'
```

### Example Response
```json
{
  "success": true,
  "message": "ProposalLine created successfully",
  "data": {
  "ID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": null,
  "Description": null,
  "Amount": 1500,
  "ProposalID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "EstimateCategoryID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Created": null,
  "CreatedBy": null,
  "Updated": null,
  "UpdatedBy": null,
  "ParentEstimateCategoryID": null,
  "SqFoot": null,
  "Multiplier": null,
  "Percentage": null,
  "Sequence": null,
  "SqFootLocked": false
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 4. Update ProposalLine

**PUT** `/api/v1/proposallines/:id`

### Description
Update an existing proposalline.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProposalLine ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/proposallines/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json" \
  -d '{
  "Name": "Updated Name",
  "Description": "Updated description"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "ProposalLine updated successfully",
  "data": {
  "ID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": null,
  "Description": null,
  "Amount": 1500,
  "ProposalID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "EstimateCategoryID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Created": null,
  "CreatedBy": null,
  "Updated": null,
  "UpdatedBy": null,
  "ParentEstimateCategoryID": null,
  "SqFoot": null,
  "Multiplier": null,
  "Percentage": null,
  "Sequence": null,
  "SqFootLocked": false
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 5. Delete ProposalLine

**DELETE** `/api/v1/proposallines/:id`

### Description
Delete a proposalline (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | ProposalLine ID |

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/proposallines/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "ProposalLine deleted successfully",
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
  "message": "ProposalLine not found",
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

### ID
- **Type:** uniqueidentifier
- **Nullable:** NO
- **Primary Key:** YES

- **Description:** Unique identifier for this record

### Name
- **Type:** nvarchar (max length: 200)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Display name

### Description
- **Type:** nvarchar (max length: -1)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Detailed description

### Amount
- **Type:** decimal
- **Nullable:** NO
- **Primary Key:** NO



### ProposalID
- **Type:** uniqueidentifier
- **Nullable:** NO
- **Primary Key:** NO



### EstimateCategoryID
- **Type:** uniqueidentifier
- **Nullable:** NO
- **Primary Key:** NO



### Created
- **Type:** datetime2
- **Nullable:** YES
- **Primary Key:** NO



### CreatedBy
- **Type:** nvarchar (max length: -1)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** User ID who created this record

### Updated
- **Type:** datetime2
- **Nullable:** YES
- **Primary Key:** NO



### UpdatedBy
- **Type:** nvarchar (max length: -1)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** User ID who last updated this record

### ParentEstimateCategoryID
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### SqFoot
- **Type:** decimal
- **Nullable:** YES
- **Primary Key:** NO



### Multiplier
- **Type:** decimal
- **Nullable:** YES
- **Primary Key:** NO



### Percentage
- **Type:** float
- **Nullable:** YES
- **Primary Key:** NO



### Sequence
- **Type:** int
- **Nullable:** YES
- **Primary Key:** NO



### SqFootLocked
- **Type:** bit
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** ((0))


---

**Generated:** 2025-11-13T06:33:19.282Z
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
