# Clients API Reference

## Table Schema

### Database Table: `dbo.[Clients]`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
| Id | uniqueidentifier | N/A | NO | YES | NULL |
| UserId | int | N/A | YES | NO | NULL |
| Name | nvarchar | 100 | NO | NO | NULL |
| Address | nchar | 200 | YES | NO | NULL |
| City | nvarchar | 100 | YES | NO | NULL |
| State | nvarchar | 10 | YES | NO | NULL |
| CompanyName | nvarchar | 100 | YES | NO | NULL |
| EmailAddress | nvarchar | 100 | NO | NO | NULL |
| SecondaryEmailAddress | nvarchar | 250 | YES | NO | NULL |
| Phone | nvarchar | 50 | YES | NO | NULL |
| DateCreated | datetime2 | N/A | NO | NO | NULL |
| CreatedBy | int | N/A | NO | NO | NULL |
| DateUpdated | datetime2 | N/A | YES | NO | NULL |
| UpdatedBy | int | N/A | YES | NO | NULL |

---

## API Endpoints

### Base URL
```
https://joeapi.fly.dev/api/v1/clients
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## 1. List Clients

**GET** `/api/v1/clients`

### Description
Retrieve a paginated list of clients.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `search` | string | - | Search term (optional) |


### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/clients?page=1&limit=20" \
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
  "UserId": null,
  "Name": "Sample Name",
  "Address": null,
  "City": null,
  "State": null,
  "CompanyName": null,
  "EmailAddress": "example@email.com",
  "SecondaryEmailAddress": null,
  "Phone": null,
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

## 2. Get Client by ID

**GET** `/api/v1/clients/:id`

### Description
Retrieve a single client by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Client ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/clients/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "UserId": null,
  "Name": "Sample Name",
  "Address": null,
  "City": null,
  "State": null,
  "CompanyName": null,
  "EmailAddress": "example@email.com",
  "SecondaryEmailAddress": null,
  "Phone": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 3. Create Client

**POST** `/api/v1/clients`

### Description
Create a new client.

### Request Body

#### Required Fields:
- `Name` (nvarchar, max 100)
- `EmailAddress` (nvarchar, max 100)

#### Optional Fields:
- `UserId` (int)
- `Address` (nchar, max 200)
- `City` (nvarchar, max 100)
- `State` (nvarchar, max 10)
- `CompanyName` (nvarchar, max 100)
- `SecondaryEmailAddress` (nvarchar, max 250)
- `Phone` (nvarchar, max 50)

### Example Request
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/clients" \
  -H "Content-Type: application/json" \
  -d '{
  "Name": "New Client",
  "City": "San Francisco",
  "State": "CA",
  "CompanyName": "ABC Construction",
  "EmailAddress": "newclient@example.com",
  "SecondaryEmailAddress": "newclient@example.com",
  "Phone": "555-1234"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "UserId": null,
  "Name": "Sample Name",
  "Address": null,
  "City": null,
  "State": null,
  "CompanyName": null,
  "EmailAddress": "example@email.com",
  "SecondaryEmailAddress": null,
  "Phone": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 4. Update Client

**PUT** `/api/v1/clients/:id`

### Description
Update an existing client.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Client ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/clients/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json" \
  -d '{
  "Name": "Updated Name"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "UserId": null,
  "Name": "Sample Name",
  "Address": null,
  "City": null,
  "State": null,
  "CompanyName": null,
  "EmailAddress": "example@email.com",
  "SecondaryEmailAddress": null,
  "Phone": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "CreatedBy": 100,
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 5. Delete Client

**DELETE** `/api/v1/clients/:id`

### Description
Delete a client (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Client ID |

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/clients/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Client deleted successfully",
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
  "message": "Client not found",
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

### UserId
- **Type:** int
- **Nullable:** YES
- **Primary Key:** NO



### Name
- **Type:** nvarchar (max length: 100)
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Display name

### Address
- **Type:** nchar (max length: 200)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Street address

### City
- **Type:** nvarchar (max length: 100)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** City name

### State
- **Type:** nvarchar (max length: 10)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** State code (e.g., CA, NY)

### CompanyName
- **Type:** nvarchar (max length: 100)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Company or organization name

### EmailAddress
- **Type:** nvarchar (max length: 100)
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Email address

### SecondaryEmailAddress
- **Type:** nvarchar (max length: 250)
- **Nullable:** YES
- **Primary Key:** NO



### Phone
- **Type:** nvarchar (max length: 50)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Phone number

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

---

**Generated:** 2025-11-13T06:33:18.341Z
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
