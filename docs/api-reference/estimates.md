# Estimates API Reference

## Table Schema

### Database Table: `dbo.[Estimates]`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
| ID | uniqueidentifier | N/A | NO | YES | NULL |
| Amount | decimal | N/A | YES | NO | NULL |
| EstimateSubCategoryID | uniqueidentifier | N/A | YES | NO | NULL |
| QBClassID | uniqueidentifier | N/A | YES | NO | NULL |
| Created | datetime2 | N/A | YES | NO | NULL |
| CreatedBy | nvarchar | -1 | YES | NO | NULL |
| ProjectCompletionDate | datetime2 | N/A | YES | NO | NULL |
| Updated | datetime2 | N/A | YES | NO | NULL |
| UpdatedBy | nvarchar | -1 | YES | NO | NULL |

---

## API Endpoints

### Base URL
```
https://joeapi.fly.dev/api/v1/estimates
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## 1. List Estimates

**GET** `/api/v1/estimates`

### Description
Retrieve a paginated list of estimates.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `search` | string | - | Search term (optional) |


### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/estimates?page=1&limit=20" \
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
  "Amount": null,
  "EstimateSubCategoryID": null,
  "QBClassID": null,
  "Created": null,
  "CreatedBy": null,
  "ProjectCompletionDate": "2025-11-13T00:00:00.000Z",
  "Updated": null,
  "UpdatedBy": null
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

## 2. Get Estimate by ID

**GET** `/api/v1/estimates/:id`

### Description
Retrieve a single estimate by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Estimate ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/estimates/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
  "ID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Amount": null,
  "EstimateSubCategoryID": null,
  "QBClassID": null,
  "Created": null,
  "CreatedBy": null,
  "ProjectCompletionDate": "2025-11-13T00:00:00.000Z",
  "Updated": null,
  "UpdatedBy": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 3. Create Estimate

**POST** `/api/v1/estimates`

### Description
Create a new estimate.

### Request Body

#### Required Fields:
None

#### Optional Fields:
- `Amount` (decimal)
- `EstimateSubCategoryID` (uniqueidentifier)
- `QBClassID` (uniqueidentifier)
- `Created` (datetime2)
- `ProjectCompletionDate` (datetime2)
- `Updated` (datetime2)

### Example Request
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/estimates" \
  -H "Content-Type: application/json" \
  -d '{
  "Amount": 2500
}'
```

### Example Response
```json
{
  "success": true,
  "message": "Estimate created successfully",
  "data": {
  "ID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Amount": null,
  "EstimateSubCategoryID": null,
  "QBClassID": null,
  "Created": null,
  "CreatedBy": null,
  "ProjectCompletionDate": "2025-11-13T00:00:00.000Z",
  "Updated": null,
  "UpdatedBy": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 4. Update Estimate

**PUT** `/api/v1/estimates/:id`

### Description
Update an existing estimate.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Estimate ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/estimates/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Example Response
```json
{
  "success": true,
  "message": "Estimate updated successfully",
  "data": {
  "ID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Amount": null,
  "EstimateSubCategoryID": null,
  "QBClassID": null,
  "Created": null,
  "CreatedBy": null,
  "ProjectCompletionDate": "2025-11-13T00:00:00.000Z",
  "Updated": null,
  "UpdatedBy": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 5. Delete Estimate

**DELETE** `/api/v1/estimates/:id`

### Description
Delete a estimate (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Estimate ID |

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/estimates/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Estimate deleted successfully",
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
  "message": "Estimate not found",
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

### Amount
- **Type:** decimal
- **Nullable:** YES
- **Primary Key:** NO



### EstimateSubCategoryID
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### QBClassID
- **Type:** uniqueidentifier
- **Nullable:** YES
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

### ProjectCompletionDate
- **Type:** datetime2
- **Nullable:** YES
- **Primary Key:** NO



### Updated
- **Type:** datetime2
- **Nullable:** YES
- **Primary Key:** NO



### UpdatedBy
- **Type:** nvarchar (max length: -1)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** User ID who last updated this record

---

**Generated:** 2025-11-13T06:33:19.489Z
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
