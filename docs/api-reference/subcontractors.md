# SubContractors API Reference

## Table Schema

### Database Table: `dbo.[SubContractors]`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
| Id | uniqueidentifier | N/A | NO | YES | NULL |
| Name | nvarchar | 100 | NO | NO | NULL |
| Address | nvarchar | 200 | YES | NO | NULL |
| City | nvarchar | 50 | YES | NO | NULL |
| State | nvarchar | 50 | YES | NO | NULL |
| Company | nvarchar | 100 | YES | NO | NULL |
| Email | nvarchar | 100 | NO | NO | NULL |
| Phone | nvarchar | 100 | YES | NO | NULL |
| LicenseNo | nvarchar | 100 | YES | NO | NULL |
| LicenseExp | date | N/A | YES | NO | NULL |
| LiabilityInsurancePolicyNo | nvarchar | 100 | YES | NO | NULL |
| LiabilityInsuranceExpiry | date | N/A | YES | NO | NULL |
| CompInsurancePolicyNo | nvarchar | 100 | YES | NO | NULL |
| CompInsuranceExpiry | date | N/A | YES | NO | NULL |
| BondInsurancePolicyNo | nvarchar | 100 | YES | NO | NULL |
| BondInsuranceExpiry | date | N/A | YES | NO | NULL |
| Category | nvarchar | 150 | YES | NO | NULL |
| CreatedBy | int | N/A | NO | NO | NULL |
| UpdatedBy | int | N/A | YES | NO | NULL |
| DateCreated | datetime | N/A | NO | NO | NULL |
| DateUpdated | datetime | N/A | YES | NO | NULL |
| IsActive | bit | N/A | YES | NO | NULL |
| Zip | nvarchar | 20 | YES | NO | NULL |

---

## API Endpoints

### Base URL
```
https://joeapi.fly.dev/api/v1/subcontractors
```

### Authentication
All endpoints require authentication. In development mode, uses `DEV_USER_ID` from environment.

---

## 1. List SubContractors

**GET** `/api/v1/subcontractors`

### Description
Retrieve a paginated list of subcontractors.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `search` | string | - | Search term (optional) |
| `category` | string | - | Filter by category |
| `includeInactive` | boolean | false | Include inactive subcontractors |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/subcontractors?page=1&limit=20" \
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
  "Address": null,
  "City": null,
  "State": null,
  "Company": null,
  "Email": "example@email.com",
  "Phone": null,
  "LicenseNo": null,
  "LicenseExp": null,
  "LiabilityInsurancePolicyNo": null,
  "LiabilityInsuranceExpiry": null,
  "CompInsurancePolicyNo": null,
  "CompInsuranceExpiry": null,
  "BondInsurancePolicyNo": null,
  "BondInsuranceExpiry": null,
  "Category": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "IsActive": null,
  "Zip": null
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

## 2. Get SubContractor by ID

**GET** `/api/v1/subcontractors/:id`

### Description
Retrieve a single subcontractor by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | SubContractor ID |

### Example Request
```bash
curl -X GET "https://joeapi.fly.dev/api/v1/subcontractors/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
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
  "Address": null,
  "City": null,
  "State": null,
  "Company": null,
  "Email": "example@email.com",
  "Phone": null,
  "LicenseNo": null,
  "LicenseExp": null,
  "LiabilityInsurancePolicyNo": null,
  "LiabilityInsuranceExpiry": null,
  "CompInsurancePolicyNo": null,
  "CompInsuranceExpiry": null,
  "BondInsurancePolicyNo": null,
  "BondInsuranceExpiry": null,
  "Category": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "IsActive": null,
  "Zip": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 3. Create SubContractor

**POST** `/api/v1/subcontractors`

### Description
Create a new subcontractor.

### Request Body

#### Required Fields:
- `Name` (nvarchar, max 100)
- `Email` (nvarchar, max 100)

#### Optional Fields:
- `Address` (nvarchar, max 200)
- `City` (nvarchar, max 50)
- `State` (nvarchar, max 50)
- `Company` (nvarchar, max 100)
- `Phone` (nvarchar, max 100)
- `LicenseNo` (nvarchar, max 100)
- `LicenseExp` (date)
- `LiabilityInsurancePolicyNo` (nvarchar, max 100)
- `LiabilityInsuranceExpiry` (date)
- `CompInsurancePolicyNo` (nvarchar, max 100)
- `CompInsuranceExpiry` (date)
- `BondInsurancePolicyNo` (nvarchar, max 100)
- `BondInsuranceExpiry` (date)
- `Category` (nvarchar, max 150)
- `IsActive` (bit)
- `Zip` (nvarchar, max 20)

### Example Request
```bash
curl -X POST "https://joeapi.fly.dev/api/v1/subcontractors" \
  -H "Content-Type: application/json" \
  -d '{
  "Name": "New SubContractor",
  "Address": "123 Main Street",
  "City": "San Francisco",
  "State": "CA",
  "Company": "ABC Construction",
  "Email": "newclient@example.com",
  "Phone": "555-1234"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "SubContractor created successfully",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": "Sample Name",
  "Address": null,
  "City": null,
  "State": null,
  "Company": null,
  "Email": "example@email.com",
  "Phone": null,
  "LicenseNo": null,
  "LicenseExp": null,
  "LiabilityInsurancePolicyNo": null,
  "LiabilityInsuranceExpiry": null,
  "CompInsurancePolicyNo": null,
  "CompInsuranceExpiry": null,
  "BondInsurancePolicyNo": null,
  "BondInsuranceExpiry": null,
  "Category": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "IsActive": null,
  "Zip": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 4. Update SubContractor

**PUT** `/api/v1/subcontractors/:id`

### Description
Update an existing subcontractor.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | SubContractor ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
```bash
curl -X PUT "https://joeapi.fly.dev/api/v1/subcontractors/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json" \
  -d '{
  "Name": "Updated Name"
}'
```

### Example Response
```json
{
  "success": true,
  "message": "SubContractor updated successfully",
  "data": {
  "Id": "38BB47CE-32ED-4B7C-B6F3-8F8B80204273",
  "Name": "Sample Name",
  "Address": null,
  "City": null,
  "State": null,
  "Company": null,
  "Email": "example@email.com",
  "Phone": null,
  "LicenseNo": null,
  "LicenseExp": null,
  "LiabilityInsurancePolicyNo": null,
  "LiabilityInsuranceExpiry": null,
  "CompInsurancePolicyNo": null,
  "CompInsuranceExpiry": null,
  "BondInsurancePolicyNo": null,
  "BondInsuranceExpiry": null,
  "Category": null,
  "CreatedBy": 100,
  "UpdatedBy": null,
  "DateCreated": "2025-11-13T00:00:00.000Z",
  "DateUpdated": "2025-11-13T00:00:00.000Z",
  "IsActive": null,
  "Zip": null
},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
```

---

## 5. Delete SubContractor

**DELETE** `/api/v1/subcontractors/:id`

### Description
Delete a subcontractor (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | GUID | Yes | SubContractor ID |

### Example Request
```bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/subcontractors/38BB47CE-32ED-4B7C-B6F3-8F8B80204273" \
  -H "Content-Type: application/json"
```

### Example Response
```json
{
  "success": true,
  "message": "SubContractor deleted successfully",
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
  "message": "SubContractor not found",
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
- **Type:** nvarchar (max length: 100)
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Display name

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

### Company
- **Type:** nvarchar (max length: 100)
- **Nullable:** YES
- **Primary Key:** NO



### Email
- **Type:** nvarchar (max length: 100)
- **Nullable:** NO
- **Primary Key:** NO

- **Description:** Email address

### Phone
- **Type:** nvarchar (max length: 100)
- **Nullable:** YES
- **Primary Key:** NO

- **Description:** Phone number

### LicenseNo
- **Type:** nvarchar (max length: 100)
- **Nullable:** YES
- **Primary Key:** NO



### LicenseExp
- **Type:** date
- **Nullable:** YES
- **Primary Key:** NO



### LiabilityInsurancePolicyNo
- **Type:** nvarchar (max length: 100)
- **Nullable:** YES
- **Primary Key:** NO



### LiabilityInsuranceExpiry
- **Type:** date
- **Nullable:** YES
- **Primary Key:** NO



### CompInsurancePolicyNo
- **Type:** nvarchar (max length: 100)
- **Nullable:** YES
- **Primary Key:** NO



### CompInsuranceExpiry
- **Type:** date
- **Nullable:** YES
- **Primary Key:** NO



### BondInsurancePolicyNo
- **Type:** nvarchar (max length: 100)
- **Nullable:** YES
- **Primary Key:** NO



### BondInsuranceExpiry
- **Type:** date
- **Nullable:** YES
- **Primary Key:** NO



### Category
- **Type:** nvarchar (max length: 150)
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

### IsActive
- **Type:** bit
- **Nullable:** YES
- **Primary Key:** NO



### Zip
- **Type:** nvarchar (max length: 20)
- **Nullable:** YES
- **Primary Key:** NO



---

**Generated:** 2025-11-13T06:33:18.813Z
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
