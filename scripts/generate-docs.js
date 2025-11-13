const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

const tables = [
  'Clients',
  'Contacts',
  'SubContractors',
  'Proposals',
  'ProposalLines',
  'Estimates',
  'ActionItems',
  'ProjectSchedules',
  'ProjectScheduleTasks',
  'ProjectManagements'
];

async function getTableSchema(tableName) {
  const pool = await sql.connect(config);

  const result = await pool.request().query(`
    SELECT
      c.COLUMN_NAME,
      c.DATA_TYPE,
      c.CHARACTER_MAXIMUM_LENGTH,
      c.IS_NULLABLE,
      c.COLUMN_DEFAULT,
      CASE
        WHEN pk.COLUMN_NAME IS NOT NULL THEN 'YES'
        ELSE 'NO'
      END as IS_PRIMARY_KEY
    FROM INFORMATION_SCHEMA.COLUMNS c
    LEFT JOIN (
      SELECT ku.COLUMN_NAME
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
        ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
      WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        AND tc.TABLE_NAME = '${tableName}'
    ) pk ON c.COLUMN_NAME = pk.COLUMN_NAME
    WHERE c.TABLE_NAME = '${tableName}'
    ORDER BY c.ORDINAL_POSITION
  `);

  return result.recordset;
}

async function generateDocs() {
  try {
    console.log('Connecting to database...');

    for (const table of tables) {
      console.log(`Fetching schema for ${table}...`);
      const schema = await getTableSchema(table);

      if (schema.length === 0) {
        console.log(`  Warning: No schema found for ${table}`);
        continue;
      }

      // Generate markdown content
      const content = generateMarkdown(table, schema);

      // Write to file
      const filename = path.join(__dirname, '../docs/api-reference', `${table.toLowerCase()}.md`);
      fs.writeFileSync(filename, content);
      console.log(`  ✓ Generated ${filename}`);
    }

    console.log('\n✅ All documentation generated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

function generateMarkdown(tableName, schema) {
  const endpoint = tableName.toLowerCase();
  const singular = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;

  // Determine ID field and type
  const idField = schema.find(c => c.IS_PRIMARY_KEY === 'YES');
  const idType = idField ? (idField.DATA_TYPE === 'uniqueidentifier' ? 'GUID' : 'integer') : 'GUID';

  // Get required fields (excluding auto-generated ones)
  const requiredFields = schema.filter(c =>
    c.IS_NULLABLE === 'NO' &&
    c.IS_PRIMARY_KEY === 'NO' &&
    !c.COLUMN_NAME.startsWith('Date') &&
    !c.COLUMN_NAME.includes('By') &&
    !c.COLUMN_NAME.includes('Deleted')
  );

  const optionalFields = schema.filter(c =>
    c.IS_NULLABLE === 'YES' &&
    c.IS_PRIMARY_KEY === 'NO' &&
    !c.COLUMN_NAME.startsWith('Date') &&
    !c.COLUMN_NAME.includes('By') &&
    !c.COLUMN_NAME.includes('Deleted')
  );

  return `# ${tableName} API Reference

## Table Schema

### Database Table: \`dbo.[${tableName}]\`

| Column Name | Data Type | Max Length | Nullable | Primary Key | Default |
|-------------|-----------|------------|----------|-------------|---------|
${schema.map(col =>
  `| ${col.COLUMN_NAME} | ${col.DATA_TYPE} | ${col.CHARACTER_MAXIMUM_LENGTH || 'N/A'} | ${col.IS_NULLABLE} | ${col.IS_PRIMARY_KEY} | ${col.COLUMN_DEFAULT || 'NULL'} |`
).join('\n')}

---

## API Endpoints

### Base URL
\`\`\`
https://joeapi.fly.dev/api/v1/${endpoint}
\`\`\`

### Authentication
All endpoints require authentication. In development mode, uses \`DEV_USER_ID\` from environment.

---

## 1. List ${tableName}

**GET** \`/api/v1/${endpoint}\`

### Description
Retrieve a paginated list of ${endpoint}.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| \`page\` | integer | 1 | Page number |
| \`limit\` | integer | 20 | Items per page (max: 100) |
| \`search\` | string | - | Search term (optional) |
${getAdditionalQueryParams(tableName)}

### Example Request
\`\`\`bash
curl -X GET "https://joeapi.fly.dev/api/v1/${endpoint}?page=1&limit=20" \\
  -H "Content-Type: application/json"
\`\`\`

### Example Response
\`\`\`json
{
  "success": true,
  "message": "Success",
  "data": [
    ${generateSampleObject(schema, 2)}
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
\`\`\`

---

## 2. Get ${singular} by ID

**GET** \`/api/v1/${endpoint}/:id\`

### Description
Retrieve a single ${singular.toLowerCase()} by its ID.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`id\` | ${idType} | Yes | ${singular} ID |

### Example Request
\`\`\`bash
curl -X GET "https://joeapi.fly.dev/api/v1/${endpoint}/${getSampleId(idType)}" \\
  -H "Content-Type: application/json"
\`\`\`

### Example Response
\`\`\`json
{
  "success": true,
  "message": "Success",
  "data": ${generateSampleObject(schema, 2)},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
\`\`\`

---

## 3. Create ${singular}

**POST** \`/api/v1/${endpoint}\`

### Description
Create a new ${singular.toLowerCase()}.

### Request Body

#### Required Fields:
${requiredFields.length > 0 ? requiredFields.map(f => `- \`${f.COLUMN_NAME}\` (${f.DATA_TYPE}${f.CHARACTER_MAXIMUM_LENGTH ? `, max ${f.CHARACTER_MAXIMUM_LENGTH}` : ''})`).join('\n') : 'None'}

#### Optional Fields:
${optionalFields.length > 0 ? optionalFields.map(f => `- \`${f.COLUMN_NAME}\` (${f.DATA_TYPE}${f.CHARACTER_MAXIMUM_LENGTH ? `, max ${f.CHARACTER_MAXIMUM_LENGTH}` : ''})`).join('\n') : 'None'}

### Example Request
\`\`\`bash
curl -X POST "https://joeapi.fly.dev/api/v1/${endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${generateCreatePayload(schema, tableName)}'
\`\`\`

### Example Response
\`\`\`json
{
  "success": true,
  "message": "${singular} created successfully",
  "data": ${generateSampleObject(schema, 2)},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
\`\`\`

---

## 4. Update ${singular}

**PUT** \`/api/v1/${endpoint}/:id\`

### Description
Update an existing ${singular.toLowerCase()}.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`id\` | ${idType} | Yes | ${singular} ID |

### Request Body
Any fields you want to update (all optional except validation constraints).

### Example Request
\`\`\`bash
curl -X PUT "https://joeapi.fly.dev/api/v1/${endpoint}/${getSampleId(idType)}" \\
  -H "Content-Type: application/json" \\
  -d '${generateUpdatePayload(schema, tableName)}'
\`\`\`

### Example Response
\`\`\`json
{
  "success": true,
  "message": "${singular} updated successfully",
  "data": ${generateSampleObject(schema, 2)},
  "timestamp": "2025-11-13T00:00:00.000Z"
}
\`\`\`

---

## 5. Delete ${singular}

**DELETE** \`/api/v1/${endpoint}/:id\`

### Description
Delete a ${singular.toLowerCase()} (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`id\` | ${idType} | Yes | ${singular} ID |

### Example Request
\`\`\`bash
curl -X DELETE "https://joeapi.fly.dev/api/v1/${endpoint}/${getSampleId(idType)}" \\
  -H "Content-Type: application/json"
\`\`\`

### Example Response
\`\`\`json
{
  "success": true,
  "message": "${singular} deleted successfully",
  "data": null,
  "timestamp": "2025-11-13T00:00:00.000Z"
}
\`\`\`

---

## Error Responses

### 400 Bad Request - Validation Error
\`\`\`json
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
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "success": false,
  "message": "No authorization header provided",
  "timestamp": "2025-11-13T00:00:00.000Z"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "success": false,
  "message": "${singular} not found",
  "timestamp": "2025-11-13T00:00:00.000Z"
}
\`\`\`

### 500 Internal Server Error
\`\`\`json
{
  "success": false,
  "message": "Internal server error",
  "timestamp": "2025-11-13T00:00:00.000Z"
}
\`\`\`

---

## Field Descriptions

${schema.map(col => `### ${col.COLUMN_NAME}
- **Type:** ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? ` (max length: ${col.CHARACTER_MAXIMUM_LENGTH})` : ''}
- **Nullable:** ${col.IS_NULLABLE}
- **Primary Key:** ${col.IS_PRIMARY_KEY}
${col.COLUMN_DEFAULT ? `- **Default:** ${col.COLUMN_DEFAULT}` : ''}
${getFieldDescription(col.COLUMN_NAME, col.DATA_TYPE)}`).join('\n\n')}

---

**Generated:** ${new Date().toISOString()}
**API Version:** 1.0.0
**Base URL:** https://joeapi.fly.dev
`;
}

function getAdditionalQueryParams(tableName) {
  if (tableName === 'ActionItems') {
    return `| \`projectId\` | GUID | - | Filter by project ID |
| \`includeDeleted\` | boolean | false | Include soft-deleted items |
| \`includeArchived\` | boolean | false | Include archived items |`;
  }

  if (tableName === 'SubContractors') {
    return `| \`category\` | string | - | Filter by category |
| \`includeInactive\` | boolean | false | Include inactive subcontractors |`;
  }

  if (tableName === 'Contacts') {
    return `| \`includeInactive\` | boolean | false | Include inactive contacts |`;
  }

  if (tableName === 'Proposals') {
    return `| \`clientId\` | GUID | - | Filter by client ID |
| \`includeDeleted\` | boolean | false | Include deleted proposals |
| \`includeArchived\` | boolean | false | Include archived proposals |`;
  }

  if (tableName === 'ProposalLines') {
    return `| \`proposalId\` | GUID | - | Filter by proposal ID |`;
  }

  if (tableName === 'ProjectScheduleTasks') {
    return `| \`scheduleId\` | GUID | - | Filter by schedule ID |`;
  }

  return '';
}

function getSampleId(idType) {
  return idType === 'GUID' ? '38BB47CE-32ED-4B7C-B6F3-8F8B80204273' : '123';
}

function getFieldDescription(columnName, dataType) {
  const descriptions = {
    'Id': '- **Description:** Unique identifier for this record',
    'ID': '- **Description:** Unique identifier for this record',
    'Name': '- **Description:** Display name',
    'EmailAddress': '- **Description:** Email address',
    'Email': '- **Description:** Email address',
    'Phone': '- **Description:** Phone number',
    'Address': '- **Description:** Street address',
    'City': '- **Description:** City name',
    'State': '- **Description:** State code (e.g., CA, NY)',
    'CompanyName': '- **Description:** Company or organization name',
    'Title': '- **Description:** Title or heading',
    'Description': '- **Description:** Detailed description',
    'Status': '- **Description:** Status code (integer)',
    'Source': '- **Description:** Source code (integer)',
    'ActionTypeId': '- **Description:** Type of action (integer)',
    'ProjectId': '- **Description:** Related project ID (GUID)',
    'ClientId': '- **Description:** Related client ID (GUID)',
    'ProposalId': '- **Description:** Related proposal ID (GUID)',
    'DueDate': '- **Description:** Due date in ISO 8601 format',
    'IsDeleted': '- **Description:** Soft delete flag',
    'IsArchived': '- **Description:** Archive flag',
    'DateCreated': '- **Description:** Auto-generated creation timestamp',
    'DateUpdated': '- **Description:** Auto-generated update timestamp',
    'CreatedBy': '- **Description:** User ID who created this record',
    'UpdatedBy': '- **Description:** User ID who last updated this record',
    'TotalAmount': '- **Description:** Total amount in currency',
    'AcceptedBy': '- **Description:** User ID who accepted this item'
  };

  return descriptions[columnName] || '';
}

function generateSampleObject(schema, indent = 0) {
  const obj = {};

  schema.forEach(col => {
    const name = col.COLUMN_NAME;
    const type = col.DATA_TYPE;

    if (type === 'uniqueidentifier') {
      obj[name] = '38BB47CE-32ED-4B7C-B6F3-8F8B80204273';
    } else if (type === 'int') {
      if (name.toLowerCase().includes('id') || name.includes('Type')) {
        obj[name] = 1;
      } else if (name.includes('Status')) {
        obj[name] = 1;
      } else if (name.includes('Source')) {
        obj[name] = 1;
      } else {
        obj[name] = 100;
      }
    } else if (type === 'bit') {
      obj[name] = false;
    } else if (type === 'datetime' || type === 'datetime2') {
      obj[name] = '2025-11-13T00:00:00.000Z';
    } else if (type === 'decimal' || type === 'money') {
      obj[name] = 1500.00;
    } else if (type === 'nvarchar' || type === 'varchar') {
      if (name.includes('Email')) {
        obj[name] = 'example@email.com';
      } else if (name.includes('Phone')) {
        obj[name] = '555-1234';
      } else if (name.includes('Name')) {
        obj[name] = 'Sample Name';
      } else if (name.includes('Address')) {
        obj[name] = '123 Main St';
      } else if (name.includes('City')) {
        obj[name] = 'San Francisco';
      } else if (name.includes('State')) {
        obj[name] = 'CA';
      } else if (name.includes('Description')) {
        obj[name] = 'Sample description';
      } else if (name.includes('Title')) {
        obj[name] = 'Sample Title';
      } else {
        obj[name] = 'Sample value';
      }
    } else {
      obj[name] = null;
    }

    // Set nullable fields to null
    if (col.IS_NULLABLE === 'YES' && !name.includes('Date')) {
      obj[name] = null;
    }
  });

  return JSON.stringify(obj, null, indent);
}

function generateCreatePayload(schema, tableName) {
  const obj = {};

  // Only include user-providable fields
  schema.forEach(col => {
    const name = col.COLUMN_NAME;

    // Skip auto-generated fields
    if (name === 'Id' || name === 'ID') return;
    if (name.startsWith('Date') && (name.includes('Created') || name.includes('Updated'))) return;
    if (name.includes('CreatedBy') || name.includes('UpdatedBy')) return;
    if (name === 'IsDeleted') return;

    const type = col.DATA_TYPE;
    const required = col.IS_NULLABLE === 'NO';

    if (type === 'uniqueidentifier') {
      if (name.includes('Project') || name.includes('Client')) {
        obj[name] = required ? '38BB47CE-32ED-4B7C-B6F3-8F8B80204273' : null;
      }
    } else if (type === 'int') {
      if (name.includes('Type')) {
        obj[name] = 5;
      } else if (name.includes('Status')) {
        obj[name] = 1;
      } else if (name.includes('Source')) {
        obj[name] = 1;
      } else if (required) {
        obj[name] = 1;
      }
    } else if (type === 'bit') {
      if (name === 'IsArchived') {
        obj[name] = false;
      }
    } else if (type === 'datetime' || type === 'datetime2') {
      if (name.includes('Due')) {
        obj[name] = '2025-12-31T00:00:00.000Z';
      } else if (required) {
        obj[name] = '2025-11-13T00:00:00.000Z';
      }
    } else if (type === 'decimal' || type === 'money') {
      if (name.includes('Amount')) {
        obj[name] = 2500.00;
      }
    } else if (type === 'nvarchar' || type === 'varchar') {
      if (name.includes('Email')) {
        obj[name] = 'newclient@example.com';
      } else if (name.includes('Phone')) {
        obj[name] = '555-1234';
      } else if (name.includes('Name') && required) {
        obj[name] = 'New ' + (tableName.endsWith('s') ? tableName.slice(0, -1) : tableName);
      } else if (name.includes('Title') && required) {
        obj[name] = 'Sample Title';
      } else if (name.includes('Description') && required) {
        obj[name] = 'Sample description';
      } else if (name.includes('Address')) {
        obj[name] = '123 Main Street';
      } else if (name.includes('City')) {
        obj[name] = 'San Francisco';
      } else if (name.includes('State')) {
        obj[name] = 'CA';
      } else if (name.includes('Company')) {
        obj[name] = 'ABC Construction';
      } else if (required && name !== 'AcceptedBy') {
        obj[name] = 'Sample value';
      }
    }
  });

  return JSON.stringify(obj, null, 2);
}

function generateUpdatePayload(schema, tableName) {
  const obj = {};

  // Just show a couple fields being updated
  const nameField = schema.find(c => c.COLUMN_NAME.includes('Name') && !c.COLUMN_NAME.includes('Company'));
  const descField = schema.find(c => c.COLUMN_NAME.includes('Description'));
  const titleField = schema.find(c => c.COLUMN_NAME.includes('Title'));

  if (titleField) {
    obj[titleField.COLUMN_NAME] = 'Updated Title';
  } else if (nameField) {
    obj[nameField.COLUMN_NAME] = 'Updated Name';
  }

  if (descField) {
    obj[descField.COLUMN_NAME] = 'Updated description';
  }

  return JSON.stringify(obj, null, 2);
}

generateDocs();
