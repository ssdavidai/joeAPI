# Contacts API Reference

## Table Schema

### Database Table: `dbo.[Contacts]`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
| Id | uniqueidentifier | N/A | NO | YES | NULL |
| Name | nvarchar | -1 | NO | NO | NULL |
| Email | nvarchar | 100 | YES | NO | NULL |
| Phone | nvarchar | 100 | YES | NO | NULL |
| Address | nvarchar | 200 | YES | NO | NULL |
| City | nvarchar | 50 | YES | NO | NULL |
| State | nvarchar | 50 | YES | NO | NULL |
| IsActive | bit | N/A | NO | NO | NULL |
| CreatedBy | int | N/A | NO | NO | NULL |
| DateCreated | datetime | N/A | NO | NO | NULL |
| UpdatedBy | int | N/A | YES | NO | NULL |
| DateUpdated | datetime | N/A | YES | NO | NULL |

---

## API Endpoints

### Base URL
```
https://joeapi.fly.dev/api/v1/contacts
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## 1. List Contacts

**GET** `/api/v1/contacts`

### Description
Retrieve a paginated list of contacts.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `search` | string | - | Search term (optional) |
| `includeInactive` | boolean | false | Include inactive contacts |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/contacts?page=1&limit=20" \
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
  "Name": "Sample Name",
  "Email": null,
  "Phone": null,
  "Address": null,
  "City": null,
  "State": null,
  "IsActive": false,
  "CreatedBy": 100,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null,
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

## 2. Get Contact by ID

**GET** `/api/v1/contacts/:id`

### Description
Retrieve a single contact by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Contact ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/contacts/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": "Sample Name",
  "Email": null,
  "Phone": null,
  "Address": null,
  "City": null,
  "State": null,
  "IsActive": false,
  "CreatedBy": 100,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null,
  "DateUpdated": "2025-11-13T00:00:00.000Z"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 3. Create Contact

**POST** `/api/v1/contacts`

### Description
Create a new contact.

### Request Body

#### Required Fields:
- `Name` (nvarchar, max -1)
- `IsActive` (bit)

#### Optional Fields:
- `Email` (nvarchar, max 100)
- `Phone` (nvarchar, max 100)
- `Address` (nvarchar, max 200)
- `City` (nvarchar, max 50)
- `State` (nvarchar, max 50)

### Example Request
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/contacts" \
  -H "Content-Type: application/json" \
  -d '{
  "Name": "New Contact",
  "Email": "newclient@example.com",
  "Phone": "555-1234",
  "Address": "123 Main Street",
  "City": "San Francisco",
  "State": "CA"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "Contact created successfully",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": "Sample Name",
  "Email": null,
  "Phone": null,
  "Address": null,
  "City": null,
  "State": null,
  "IsActive": false,
  "CreatedBy": 100,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null,
  "DateUpdated": "2025-11-13T00:00:00.000Z"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 4. Update Contact

**PUT** `/api/v1/contacts/:id`

### Description
Update an existing contact.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Contact ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/contacts/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json" \
  -d '{
  "Name": "Updated Name"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "Contact updated successfully",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": "Sample Name",
  "Email": null,
  "Phone": null,
  "Address": null,
  "City": null,
  "State": null,
  "IsActive": false,
  "CreatedBy": 100,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "UpdatedBy": null,
  "DateUpdated": "2025-11-13T00:00:00.000Z"
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 5. Delete Contact

**DELETE** `/api/v1/contacts/:id`

### Description
Delete a contact (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | Contact ID |

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/contacts/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "Contact deleted successfully",
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
  "message": "Contact not found",
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

### Name
- **Type:** nvarchar (max length: -1)
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Display name

### Email
- **Type:** nvarchar (max length: 100)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Email address

### Phone
- **Type:** nvarchar (max length: 100)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Phone number

### Address
- **Type:** nvarchar (max length: 200)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Street address

### City
- **Type:** nvarchar (max length: 50)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** City name

### State
- **Type:** nvarchar (max length: 50)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** State code (e.g., CA, NY)

### IsActive
- **Type:** bit
- **Nullable:** NO
- **Primary Key:** NO



### CreatedBy
- **Type:** int
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** User ID who created this record

### DateCreated
- **Type:** datetime
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Auto-generated creation timestamp

### UpdatedBy
- **Type:** int
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** User ID who last updated this record

### DateUpdated
- **Type:** datetime
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Auto-generated update timestamp

---

**Generated:** 2025-11-13T06:33:18.573Z
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
