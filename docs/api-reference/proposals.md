# Proposals API Reference

## Table Schema

### Database Table: `dbo.[Proposals]`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
| ID | uniqueidentifier | N/A | NO | YES | NULL |
| Number | int | N/A | NO | NO | NULL |
| TemplateId | uniqueidentifier | N/A | YES | NO | NULL |
| QBClassId | uniqueidentifier | N/A | YES | NO | NULL |
| QBCustomerId | uniqueidentifier | N/A | YES | NO | NULL |
| ProposalProjectId | uniqueidentifier | N/A | YES | NO | NULL |
| ClientId | uniqueidentifier | N/A | YES | NO | NULL |
| Date | datetime2 | N/A | NO | NO | NULL |
| TotalAmount | decimal | N/A | NO | NO | NULL |
| DocStatus | nvarchar | -1 | NO | NO | (N'') |
| IsDeleted | bit | N/A | NO | NO | ((0)) |
| IsArchived | bit | N/A | NO | NO | ((0)) |
| IncludeLinesWithZeroAmount | bit | N/A | NO | NO | ((0)) |
| DateCreated | datetime2 | N/A | NO | NO | (getdate()) |
| CreatedBy | int | N/A | NO | NO | ((1)) |
| DateUpdated | datetime2 | N/A | YES | NO | NULL |
| UpdatedBy | int | N/A | YES | NO | NULL |

---

## API Endpoints

### Base URL
```
https://joeapi.fly.dev/api/v1/proposals
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## 1. List Proposals

**GET** `/api/v1/proposals`

### Description
Retrieve a paginated list of proposals.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `search` | string | - | Search term (optional) |
| `clientId` | GUID | - | Filter by client ID |
| `includeDeleted` | boolean | false | Include deleted proposals |
| `includeArchived` | boolean | false | Include archived proposals |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/proposals?page=1&limit=20" \
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
  "Number": 100,
  "TemplateId": null,
  "QBClassId": null,
  "QBCustomerId": null,
  "ProposalProjectId": null,
  "ClientId": null,
  "Date": "2025-11-13T00:00:00.000Z",
  "TotalAmount": 1500,
  "DocStatus": "Sample value",
  "IsDeleted": false,
  "IsArchived": false,
  "IncludeLinesWithZeroAmount": false,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
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

## 2. Get Proposal by ID

**GET** `/api/v1/proposals/:id`

### Description
Retrieve a single proposal by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Proposal ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/proposals/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
  "ID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Number": 100,
  "TemplateId": null,
  "QBClassId": null,
  "QBCustomerId": null,
  "ProposalProjectId": null,
  "ClientId": null,
  "Date": "2025-11-13T00:00:00.000Z",
  "TotalAmount": 1500,
  "DocStatus": "Sample value",
  "IsDeleted": false,
  "IsArchived": false,
  "IncludeLinesWithZeroAmount": false,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 3. Create Proposal

**POST** `/api/v1/proposals`

### Description
Create a new proposal.

### Request Body

#### Required Fields:
- `Number` (int)
- `TotalAmount` (decimal)
- `DocStatus` (nvarchar, max -1)
- `IsArchived` (bit)
- `IncludeLinesWithZeroAmount` (bit)

#### Optional Fields:
- `TemplateId` (uniqueidentifier)
- `QBClassId` (uniqueidentifier)
- `QBCustomerId` (uniqueidentifier)
- `ProposalProjectId` (uniqueidentifier)
- `ClientId` (uniqueidentifier)

### Example Request
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/proposals" \
  -H "Content-Type: application/json" \
  -d '{
  "Number": 1,
  "ProposalProjectId": null,
  "ClientId": null,
  "Date": "2025-11-13T00:00:00.000Z",
  "TotalAmount": 2500,
  "DocStatus": "Sample value",
  "IsArchived": false
}'
```

### Example Response
```json
{
  "success": true,
  "message": "Proposal created successfully",
  "data": {
  "ID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Number": 100,
  "TemplateId": null,
  "QBClassId": null,
  "QBCustomerId": null,
  "ProposalProjectId": null,
  "ClientId": null,
  "Date": "2025-11-13T00:00:00.000Z",
  "TotalAmount": 1500,
  "DocStatus": "Sample value",
  "IsDeleted": false,
  "IsArchived": false,
  "IncludeLinesWithZeroAmount": false,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 4. Update Proposal

**PUT** `/api/v1/proposals/:id`

### Description
Update an existing proposal.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Proposal ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/proposals/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Example Response
```json
{
  "success": true,
  "message": "Proposal updated successfully",
  "data": {
  "ID": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Number": 100,
  "TemplateId": null,
  "QBClassId": null,
  "QBCustomerId": null,
  "ProposalProjectId": null,
  "ClientId": null,
  "Date": "2025-11-13T00:00:00.000Z",
  "TotalAmount": 1500,
  "DocStatus": "Sample value",
  "IsDeleted": false,
  "IsArchived": false,
  "IncludeLinesWithZeroAmount": false,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 5. Delete Proposal

**DELETE** `/api/v1/proposals/:id`

### Description
Delete a proposal (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Proposal ID |

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/proposals/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Proposal deleted successfully",
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
  "message": "Proposal not found",
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

### Number
- **Type:** int
- **Nullable:** NO
- **Primary Key:** NO



### TemplateId
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### QBClassId
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### QBCustomerId
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### ProposalProjectId
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO



### ClientId
- **Type:** uniqueidentifier
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Related client ID (GUID)

### Date
- **Type:** datetime2
- **Nullable:** NO
- **Primary Key:** NO



### TotalAmount
- **Type:** decimal
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Total amount in currency

### DocStatus
- **Type:** nvarchar (max length: -1)
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** (N'')


### IsDeleted
- **Type:** bit
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** ((0))
- **Description:** Soft delete flag

### IsArchived
- **Type:** bit
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** ((0))
- **Description:** Archive flag

### IncludeLinesWithZeroAmount
- **Type:** bit
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** ((0))


### DateCreated
- **Type:** datetime2
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** (getdate())
- **Description:** Auto-generated creation timestamp

### CreatedBy
- **Type:** int
- **Nullable:** NO
- **Primary Key:** NO
- **Default:** ((1))
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

---

**Generated:** 2025-11-13T06:33:19.051Z
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
