# JoeAPI - Construction Management REST API

[![smithery badge](https://smithery.ai/badge/@ssdavidai/joeapi)](https://smithery.ai/server/@ssdavidai/joeapi)

REST API for construction management system built on chaconstruction-test MSSQL database.

## Project Status

**Current Phase:** Phase 2 Complete - All Tier 1 APIs Built
**APIs Implemented:** 10 / 26 (Tier 1: 10/10 ✅ | Tier 2: 0/16)
**Test Coverage:** 0% (pending Phase 3)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:
- Database credentials
- JWT secret
- Port

### 3. Verify Database Connection

```bash
npm run verify-db
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start on http://localhost:3000

### 5. Test API

```bash
# Health check
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/health/db
```

## API Endpoints

### Tier 1 (Must-Have) - 10 APIs ✅ COMPLETE

- [x] GET/POST/PUT/DELETE `/api/v1/clients` - Multi-tenant (UserId), hard delete
- [x] GET/POST/PUT/DELETE `/api/v1/contacts` - No multi-tenancy, soft delete (IsActive)
- [x] GET/POST/PUT/DELETE `/api/v1/proposals` - FK validation (ClientId), soft delete (IsDeleted)
- [x] GET/POST/PUT/DELETE `/api/v1/proposallines` - 3-way FK validation, hard delete
- [x] GET/POST/PUT/DELETE `/api/v1/estimates` - Special audit fields (nvarchar), hard delete
- [x] GET/POST/PUT/DELETE `/api/v1/projectmanagements` - No constraints, hard delete
- [x] GET/POST/PUT/DELETE `/api/v1/projectschedules` - Audit trail, hard delete
- [x] GET/POST/PUT/DELETE `/api/v1/projectscheduletasks` - FK validation, hard delete
- [x] GET/POST/PUT/DELETE `/api/v1/actionitems` - INT primary key, soft delete (IsDeleted)
- [x] GET/POST/PUT/DELETE `/api/v1/subcontractors` - Soft delete (IsActive), no multi-tenancy

### Tier 2 (Should-Have) - 16 APIs

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for complete list.

## Architecture

```
joeapi/
├── src/
│   ├── config/          # Database and app configuration
│   ├── middleware/      # Auth, multi-tenancy, audit, validation
│   ├── utils/           # Helper functions
│   ├── routes/          # API route definitions
│   ├── controllers/     # Business logic
│   └── app.js           # Express application
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── security/        # Security tests
└── scripts/             # Utility scripts
```

## Key Features

- **Multi-Tenancy**: All data scoped by UserId
- **Audit Trail**: Automatic CreatedBy/UpdatedBy tracking
- **Soft Delete**: Records marked inactive, not deleted
- **Foreign Key Validation**: Prevents invalid references
- **Pagination**: All list endpoints support paging
- **Security**: JWT authentication, input validation, SQL injection prevention

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

## Development

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed development roadmap.

## Database

- **Server**: contractorsdesk.database.windows.net
- **Database**: chaconstruction-test
- **Type**: Microsoft SQL Server (Azure)
- **Tables**: 99 total (67 business operational)

## License

ISC