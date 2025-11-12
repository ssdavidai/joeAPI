# JoeAPI - Construction Management API - Project Plan

**Created:** 2025-11-12
**Database:** chaconstruction-test (MSSQL)
**Target:** 26 REST APIs (10 Tier 1 + 16 Tier 2)

---

## 📋 MASTER TODO LIST

### ✅ = Completed | 🔄 = In Progress | ⏳ = Pending | ❌ = Blocked

---

## PHASE 0: PROJECT SETUP (Critical Foundation)

### 0.1 Environment Setup
- [ ] ⏳ Create project folder structure
- [ ] ⏳ Initialize Node.js project (package.json)
- [ ] ⏳ Create .env file for database credentials
- [ ] ⏳ Create .gitignore (exclude node_modules, .env)
- [ ] ⏳ Create README.md with project overview

### 0.2 Install Dependencies
- [ ] ⏳ Install Express.js (web framework)
- [ ] ⏳ Install mssql (SQL Server driver)
- [ ] ⏳ Install dotenv (environment variables)
- [ ] ⏳ Install joi (validation)
- [ ] ⏳ Install jsonwebtoken (JWT auth)
- [ ] ⏳ Install morgan (logging)
- [ ] ⏳ Install helmet (security)
- [ ] ⏳ Install cors (CORS support)
- [ ] ⏳ Install nodemon (dev auto-reload)
- [ ] ⏳ Install jest (testing framework)
- [ ] ⏳ Install supertest (API testing)

### 0.3 Folder Structure
```
joeapi/
├── src/
│   ├── config/
│   │   └── database.js          # DB connection config
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── multiTenant.js       # UserId filtering
│   │   ├── audit.js             # CreatedBy/UpdatedBy
│   │   ├── errorHandler.js      # Error handling
│   │   └── validator.js         # Input validation
│   ├── utils/
│   │   ├── response.js          # Response formatting
│   │   ├── dbHelper.js          # Database utilities
│   │   └── validation.js        # Validation functions
│   ├── routes/
│   │   ├── clients.js
│   │   ├── contacts.js
│   │   ├── proposals.js
│   │   └── ... (one per table)
│   ├── controllers/
│   │   ├── clientsController.js
│   │   ├── contactsController.js
│   │   └── ... (one per table)
│   ├── models/ (optional - schema definitions)
│   └── app.js                   # Express app setup
├── tests/
│   ├── unit/
│   ├── integration/
│   └── security/
├── scripts/
│   └── verify-db.js             # DB verification script
├── .env
├── .gitignore
├── package.json
├── README.md
└── PROJECT_PLAN.md (this file)
```

- [ ] ⏳ Create all folders
- [ ] ⏳ Create placeholder files for each module

---

## PHASE 1: CORE INFRASTRUCTURE

### 1.1 Database Connection
- [ ] ⏳ Create config/database.js with connection pool
- [ ] ⏳ Configure connection string from .env
- [ ] ⏳ Implement connection retry logic
- [ ] ⏳ Create database health check endpoint
- [ ] ⏳ **VERIFY:** Test connection to chaconstruction-test
- [ ] ⏳ **VERIFY:** Query sys.tables to confirm access

### 1.2 Authentication Middleware
- [ ] ⏳ Create middleware/auth.js
- [ ] ⏳ Implement Bearer token parsing
- [ ] ⏳ Implement JWT validation (or mock for development)
- [ ] ⏳ Extract userId from token claims
- [ ] ⏳ Attach userId to req.user
- [ ] ⏳ Return 401 if no token
- [ ] ⏳ Return 401 if invalid token
- [ ] ⏳ **VERIFY:** Test with valid token
- [ ] ⏳ **VERIFY:** Test with invalid token
- [ ] ⏳ **VERIFY:** Test without token

### 1.3 Multi-Tenancy Middleware
- [ ] ⏳ Create middleware/multiTenant.js
- [ ] ⏳ Extract userId from req.user
- [ ] ⏳ Provide helper to add UserId to WHERE clauses
- [ ] ⏳ Provide helper to validate FK references have same UserId
- [ ] ⏳ **VERIFY:** Query Clients table filtered by UserId
- [ ] ⏳ **VERIFY:** Attempt to access other user's data (should fail)

### 1.4 Audit Trail Middleware
- [ ] ⏳ Create middleware/audit.js
- [ ] ⏳ Intercept POST requests - add CreatedBy, DateCreated
- [ ] ⏳ Intercept PUT requests - add UpdatedBy, DateUpdated
- [ ] ⏳ Use UTC timestamps
- [ ] ⏳ **VERIFY:** Create record and check CreatedBy is set
- [ ] ⏳ **VERIFY:** Update record and check UpdatedBy is set

### 1.5 Error Handling
- [ ] ⏳ Create middleware/errorHandler.js
- [ ] ⏳ Handle SQL errors (connection, syntax, FK violations)
- [ ] ⏳ Handle validation errors
- [ ] ⏳ Handle authentication errors
- [ ] ⏳ Handle authorization errors (403)
- [ ] ⏳ Handle not found errors (404)
- [ ] ⏳ Format errors consistently
- [ ] ⏳ Log errors appropriately

### 1.6 Response Formatting
- [ ] ⏳ Create utils/response.js
- [ ] ⏳ Implement success response format
- [ ] ⏳ Implement error response format
- [ ] ⏳ Implement pagination metadata format
- [ ] ⏳ Implement list response format

### 1.7 Validation Utilities
- [ ] ⏳ Create utils/validation.js
- [ ] ⏳ GUID format validator
- [ ] ⏳ Required field validator
- [ ] ⏳ Data type validator (match SQL types)
- [ ] ⏳ String length validator (check max_length from schema)
- [ ] ⏳ Foreign key existence validator
- [ ] ⏳ **VERIFY:** Test with valid GUID
- [ ] ⏳ **VERIFY:** Test with invalid GUID
- [ ] ⏳ **VERIFY:** Test FK validation against real table

### 1.8 Database Helper Utilities
- [ ] ⏳ Create utils/dbHelper.js
- [ ] ⏳ Implement parameterized query wrapper
- [ ] ⏳ Implement transaction wrapper
- [ ] ⏳ Implement soft delete helper (SET IsDeleted=1)
- [ ] ⏳ Implement pagination helper (OFFSET/FETCH)
- [ ] ⏳ Implement UserId filter helper
- [ ] ⏳ Implement FK validation helper

### 1.9 Main Application Setup
- [ ] ⏳ Create src/app.js
- [ ] ⏳ Initialize Express app
- [ ] ⏳ Configure middleware (helmet, cors, morgan, json parser)
- [ ] ⏳ Mount authentication middleware
- [ ] ⏳ Mount routes
- [ ] ⏳ Mount error handler (last)
- [ ] ⏳ Create health check endpoint (GET /health)
- [ ] ⏳ Create database status endpoint (GET /health/db)
- [ ] ⏳ **VERIFY:** Start server on port 3000
- [ ] ⏳ **VERIFY:** Hit /health endpoint
- [ ] ⏳ **VERIFY:** Hit /health/db endpoint

---

## PHASE 2: TIER 1 APIs (MUST-HAVE - 10 APIs)

**Build Order:** Start with simplest, build up complexity

### 2.1 Contacts API (Simplest - No FKs)
**Table:** dbo.Contacts (145 rows, 12 columns)

- [ ] ⏳ Create routes/contacts.js
- [ ] ⏳ Create controllers/contactsController.js
- [ ] ⏳ **GET /api/v1/contacts** - List all contacts (with UserId filter)
  - [ ] ⏳ Implement pagination (page, pageSize)
  - [ ] ⏳ Filter out IsDeleted records
  - [ ] ⏳ **VERIFY:** Query returns only current user's contacts
  - [ ] ⏳ **VERIFY:** Pagination works correctly

- [ ] ⏳ **POST /api/v1/contacts** - Create contact
  - [ ] ⏳ Validate required fields (Name, Email)
  - [ ] ⏳ Auto-set UserId from auth token
  - [ ] ⏳ Auto-set CreatedBy, DateCreated
  - [ ] ⏳ Generate new GUID for Id
  - [ ] ⏳ **VERIFY:** Insert into database
  - [ ] ⏳ **VERIFY:** Record has correct UserId
  - [ ] ⏳ **VERIFY:** CreatedBy is set

- [ ] ⏳ **GET /api/v1/contacts/:id** - Get single contact
  - [ ] ⏳ Validate GUID format
  - [ ] ⏳ Filter by UserId
  - [ ] ⏳ Return 404 if not found
  - [ ] ⏳ Return 403 if different UserId
  - [ ] ⏳ **VERIFY:** Can retrieve own contact
  - [ ] ⏳ **VERIFY:** Cannot retrieve other user's contact

- [ ] ⏳ **PUT /api/v1/contacts/:id** - Update contact
  - [ ] ⏳ Validate contact exists and belongs to user
  - [ ] ⏳ Validate input fields
  - [ ] ⏳ Auto-set UpdatedBy, DateUpdated
  - [ ] ⏳ DO NOT modify CreatedBy, DateCreated
  - [ ] ⏳ **VERIFY:** Update saves to database
  - [ ] ⏳ **VERIFY:** UpdatedBy is set correctly
  - [ ] ⏳ **VERIFY:** CreatedBy unchanged

- [ ] ⏳ **DELETE /api/v1/contacts/:id** - Soft delete contact
  - [ ] ⏳ Validate contact exists and belongs to user
  - [ ] ⏳ Set IsDeleted = 1
  - [ ] ⏳ Set UpdatedBy, DateUpdated
  - [ ] ⏳ Return 204 No Content
  - [ ] ⏳ **VERIFY:** Record marked as deleted in DB
  - [ ] ⏳ **VERIFY:** GET list no longer returns deleted record
  - [ ] ⏳ **VERIFY:** GET by id returns 404 for deleted record

- [ ] ⏳ **VERIFY COMPLETE API:**
  - [ ] ⏳ Create contact via POST
  - [ ] ⏳ List contacts via GET
  - [ ] ⏳ Update contact via PUT
  - [ ] ⏳ Delete contact via DELETE
  - [ ] ⏳ Verify multi-tenancy (cannot access other user's contacts)

### 2.2 Clients API
**Table:** dbo.Clients (207 rows, 14 columns)

- [ ] ⏳ Create routes/clients.js
- [ ] ⏳ Create controllers/clientsController.js
- [ ] ⏳ Implement all CRUD operations (GET, POST, PUT, DELETE)
- [ ] ⏳ Validate required fields: Name, CompanyName, EmailAddress, Phone
- [ ] ⏳ Apply UserId filtering
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** All operations work against live database
- [ ] ⏳ **VERIFY:** Multi-tenancy enforced
- [ ] ⏳ **VERIFY:** Cannot create client with invalid data

### 2.3 SubContractors API
**Table:** dbo.SubContractors (235 rows, 23 columns)

- [ ] ⏳ Create routes/subcontractors.js
- [ ] ⏳ Create controllers/subcontractorsController.js
- [ ] ⏳ Implement all CRUD operations
- [ ] ⏳ Validate required fields: Name, Company, Email, Phone
- [ ] ⏳ Apply UserId filtering
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** All operations work
- [ ] ⏳ **VERIFY:** Multi-tenancy enforced

### 2.4 Estimates API
**Table:** dbo.Estimates (216 rows, 9 columns)

- [ ] ⏳ Create routes/estimates.js
- [ ] ⏳ Create controllers/estimatesController.js
- [ ] ⏳ Implement all CRUD operations
- [ ] ⏳ Validate required fields: Amount
- [ ] ⏳ Validate FK: EstimateSubCategoryID (references EstimateCategories)
- [ ] ⏳ Validate FK: QBClassID (can be null)
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can create estimate
- [ ] ⏳ **VERIFY:** FK validation works
- [ ] ⏳ **VERIFY:** Cannot reference non-existent category

### 2.5 Proposals API
**Table:** dbo.Proposals (820 rows, 17 columns)

- [ ] ⏳ Create routes/proposals.js
- [ ] ⏳ Create controllers/proposalsController.js
- [ ] ⏳ Implement all CRUD operations
- [ ] ⏳ Validate required fields: Number, ClientId
- [ ] ⏳ Validate FK: ClientId (must exist and have same UserId)
- [ ] ⏳ Validate FK: ProposalProjectId (can be null)
- [ ] ⏳ Validate FK: TemplateId (can be null)
- [ ] ⏳ Apply UserId filtering
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can create proposal linked to client
- [ ] ⏳ **VERIFY:** Cannot link to other user's client
- [ ] ⏳ **VERIFY:** List proposals filtered by clientId query param

### 2.6 ProposalLines API
**Table:** dbo.ProposalLines (26,559 rows, 16 columns)

- [ ] ⏳ Create routes/proposallines.js
- [ ] ⏳ Create controllers/proposallinesController.js
- [ ] ⏳ Implement all CRUD operations
- [ ] ⏳ Validate required fields: Name, Description, Amount, ProposalID
- [ ] ⏳ Validate FK: ProposalID (must exist and belong to user)
- [ ] ⏳ Validate FK: EstimateCategoryID (can be null)
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can add lines to proposal
- [ ] ⏳ **VERIFY:** Cannot add lines to other user's proposal
- [ ] ⏳ **VERIFY:** Filter lines by proposalId query param

### 2.7 ProjectManagements API
**Table:** dbo.ProjectManagements (271 rows, 16 columns)

- [ ] ⏳ Create routes/projectmanagements.js
- [ ] ⏳ Create controllers/projectmanagementsController.js
- [ ] ⏳ Implement all CRUD operations
- [ ] ⏳ Validate required fields: StartDate, EndDate, Status
- [ ] ⏳ Validate FK: QBClassID (can be null)
- [ ] ⏳ Validate FK: ConstructionTaskID (can be null)
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can create project
- [ ] ⏳ **VERIFY:** Date validation (EndDate > StartDate)

### 2.8 ProjectSchedules API
**Table:** dbo.ProjectSchedules (313 rows, 8 columns)

- [ ] ⏳ Create routes/projectschedules.js
- [ ] ⏳ Create controllers/projectschedulesController.js
- [ ] ⏳ Implement all CRUD operations
- [ ] ⏳ Validate required fields: ProjectId, StartDate, Status
- [ ] ⏳ Validate FK: ProjectId (must exist and belong to user)
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can create schedule for project
- [ ] ⏳ **VERIFY:** Cannot create schedule for other user's project

### 2.9 ProjectScheduleTasks API
**Table:** dbo.ProjectScheduleTasks (1,724 rows, 18 columns)

- [ ] ⏳ Create routes/projectscheduletasks.js
- [ ] ⏳ Create controllers/projectscheduletasksController.js
- [ ] ⏳ Implement all CRUD operations
- [ ] ⏳ Validate required fields: ProjectScheduleId, Name, Duration
- [ ] ⏳ Validate FK: ProjectScheduleId (must exist and belong to user)
- [ ] ⏳ Validate FK: ConstructionTaskId (can be null)
- [ ] ⏳ Validate FK: Pred1, Pred2, Pred3 (task dependencies - can be null)
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can add tasks to schedule
- [ ] ⏳ **VERIFY:** Task dependencies work
- [ ] ⏳ **VERIFY:** Filter tasks by scheduleId query param

### 2.10 ActionItems API
**Table:** dbo.ActionItems (410 rows, 15 columns)

- [ ] ⏳ Create routes/actionitems.js
- [ ] ⏳ Create controllers/actionitemsController.js
- [ ] ⏳ Implement all CRUD operations
- [ ] ⏳ Validate required fields: Title, Description, ActionTypeId
- [ ] ⏳ Validate FK: ProjectId (can be null, must belong to user if set)
- [ ] ⏳ Validate FK: ActionTypeId (must exist)
- [ ] ⏳ Apply audit trail
- [ ] ⏳ Support soft delete (IsDeleted flag)
- [ ] ⏳ **VERIFY:** Can create action item
- [ ] ⏳ **VERIFY:** Can link to project
- [ ] ⏳ **VERIFY:** Filter by projectId and status query params

---

## PHASE 3: TIER 1 VERIFICATION & TESTING

### 3.1 Integration Testing
- [ ] ⏳ Test complete workflow: Create Client → Create Proposal → Add ProposalLines
- [ ] ⏳ Test complete workflow: Create Project → Create Schedule → Add Tasks
- [ ] ⏳ Test complete workflow: Create ActionItem → Update Status → Delete
- [ ] ⏳ **VERIFY:** All foreign key relationships work end-to-end
- [ ] ⏳ **VERIFY:** Multi-tenancy works across related tables

### 3.2 Multi-Tenancy Security Testing
- [ ] ⏳ Create User A's client
- [ ] ⏳ Create User B's client
- [ ] ⏳ Verify User A cannot see User B's client
- [ ] ⏳ Verify User A cannot update User B's client
- [ ] ⏳ Verify User A cannot delete User B's client
- [ ] ⏳ Verify User A cannot create proposal with User B's clientId
- [ ] ⏳ **VERIFY:** All APIs respect UserId boundaries

### 3.3 Database Verification Scripts
- [ ] ⏳ Create script to verify table schemas match code
- [ ] ⏳ Create script to verify all foreign keys are validated
- [ ] ⏳ Create script to verify audit columns are set correctly
- [ ] ⏳ Create script to verify soft deletes work correctly
- [ ] ⏳ Run all verification scripts and confirm 100% pass

---

## PHASE 4: TIER 2 APIs (SHOULD-HAVE - 16 APIs)

**Note:** Follow same pattern as Tier 1, but can be more streamlined

### 4.1 ProposalProjects API
**Table:** dbo.ProposalProjects (315 rows, 12 columns)

- [ ] ⏳ Create routes/proposalprojects.js
- [ ] ⏳ Create controllers/proposalprojectsController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate required fields: Name, Address, City, State
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Works with live database

### 4.2 EstimateCategories API
**Table:** dbo.EstimateCategories (624 rows, 9 columns)

- [ ] ⏳ Create routes/estimatecategories.js
- [ ] ⏳ Create controllers/estimatecategoriesController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate FK: ParentEstimateCategoryID (self-reference)
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Hierarchical categories work

### 4.3 ProjectSupervisors API
**Table:** dbo.ProjectSupervisors (715 rows, 5 columns)

- [ ] ⏳ Create routes/projectsupervisors.js
- [ ] ⏳ Create controllers/projectsupervisorsController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate FK: ProjectId (must exist and belong to user)
- [ ] ⏳ Validate FK: SupervisorId (references Users table)
- [ ] ⏳ **VERIFY:** Can assign supervisors to projects

### 4.4 ProjectSubContractors API
**Table:** dbo.ProjectSubContractors (rows unknown, 7 columns)

- [ ] ⏳ Create routes/projectsubcontractors.js
- [ ] ⏳ Create controllers/projectsubcontractorsController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate FK: ProjectId
- [ ] ⏳ Validate FK: SubContractorId
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can assign subcontractors to projects

### 4.5 ProjectNotes API
**Table:** dbo.ProjectNotes (rows unknown, columns unknown)

- [ ] ⏳ Query database for ProjectNotes schema
- [ ] ⏳ Create routes/projectnotes.js
- [ ] ⏳ Create controllers/projectnotesController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ **VERIFY:** Works with live database

### 4.6 ProjectDocuments API
**Table:** dbo.ProjectDocuments (rows unknown, columns unknown)

- [ ] ⏳ Query database for ProjectDocuments schema
- [ ] ⏳ Create routes/projectdocuments.js
- [ ] ⏳ Create controllers/projectdocumentsController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ **VERIFY:** Works with live database

### 4.7 ProjectScheduleDelays API
**Table:** dbo.ProjectScheduleDelays (rows unknown, 12 columns)

- [ ] ⏳ Create routes/projectscheduledelays.js
- [ ] ⏳ Create controllers/projectscheduledelaysController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate FK: ProjectScheduleId
- [ ] ⏳ Validate FK: TaskId
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can record delays on tasks

### 4.8 ConstructionTasks API
**Table:** dbo.ConstructionTasks (rows unknown, columns unknown)

- [ ] ⏳ Query database for ConstructionTasks schema
- [ ] ⏳ Create routes/constructiontasks.js
- [ ] ⏳ Create controllers/constructiontasksController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ **VERIFY:** Works with live database

### 4.9 ActionItemComments API
**Table:** dbo.ActionItemComments (rows unknown, 7 columns)

- [ ] ⏳ Create routes/actionitemcomments.js
- [ ] ⏳ Create controllers/actionitemcommentsController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate FK: ActionItemId
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can add comments to action items

### 4.10 ActionItemCostChange API
**Table:** dbo.ActionItemCostChange (rows unknown, 5 columns)

- [ ] ⏳ Create routes/actionitemcostchange.js
- [ ] ⏳ Create controllers/actionitemcostchangeController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate FK: ActionItemId
- [ ] ⏳ Validate FK: EstimateCategoryId
- [ ] ⏳ **VERIFY:** Can record cost impact

### 4.11 ActionItemScheduleChange API
**Table:** dbo.ActionItemScheduleChange (rows unknown, 5 columns)

- [ ] ⏳ Create routes/actionitemschedulechange.js
- [ ] ⏳ Create controllers/actionitemschedulechangeController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate FK: ActionItemId
- [ ] ⏳ Validate FK: ConstructionTaskId
- [ ] ⏳ **VERIFY:** Can record schedule impact

### 4.12 ActionTypes API
**Table:** dbo.ActionTypes (rows unknown, columns unknown)

- [ ] ⏳ Query database for ActionTypes schema
- [ ] ⏳ Create routes/actiontypes.js
- [ ] ⏳ Create controllers/actiontypesController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ **VERIFY:** Works with live database

### 4.13 ChangeOrders API
**Table:** dbo.ChangeOrders (rows unknown, 9 columns)

- [ ] ⏳ Create routes/changeorders.js
- [ ] ⏳ Create controllers/changeordersController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate FK: ActionItemId
- [ ] ⏳ **VERIFY:** Works with live database

### 4.14 Invoices API
**Table:** dbo.Invoices (rows unknown, 11 columns)

- [ ] ⏳ Create routes/invoices.js
- [ ] ⏳ Create controllers/invoicesController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate FK: ClientId
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can create invoices

### 4.15 InvoiceItems API
**Table:** dbo.InvoiceItems (rows unknown, 11 columns)

- [ ] ⏳ Create routes/invoiceitems.js
- [ ] ⏳ Create controllers/invoiceitemsController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Validate FK: InvoiceId
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Can add items to invoices

### 4.16 SubContractorCategories API
**Table:** dbo.SubContractorCategories (rows unknown, 7 columns)

- [ ] ⏳ Create routes/subcontractorcategories.js
- [ ] ⏳ Create controllers/subcontractorcategoriesController.js
- [ ] ⏳ Implement CRUD operations
- [ ] ⏳ Apply audit trail
- [ ] ⏳ **VERIFY:** Works with live database

---

## PHASE 5: COMPREHENSIVE TESTING

### 5.1 Unit Tests
- [ ] ⏳ Test authentication middleware
- [ ] ⏳ Test multi-tenancy middleware
- [ ] ⏳ Test audit trail middleware
- [ ] ⏳ Test validation utilities
- [ ] ⏳ Test response formatting
- [ ] ⏳ Test error handling

### 5.2 Integration Tests
- [ ] ⏳ Test complete client onboarding workflow
- [ ] ⏳ Test complete proposal creation workflow
- [ ] ⏳ Test complete project execution workflow
- [ ] ⏳ Test complete schedule management workflow
- [ ] ⏳ Test complete action item tracking workflow

### 5.3 Security Tests
- [ ] ⏳ Test SQL injection prevention
- [ ] ⏳ Test cross-user data access prevention
- [ ] ⏳ Test authentication bypass attempts
- [ ] ⏳ Test authorization bypass attempts
- [ ] ⏳ Test input validation bypass attempts

### 5.4 Performance Tests
- [ ] ⏳ Test pagination with large datasets
- [ ] ⏳ Test complex queries (multiple JOINs)
- [ ] ⏳ Test concurrent requests
- [ ] ⏳ Test database connection pooling

---

## PHASE 6: DOCUMENTATION

### 6.1 API Documentation
- [ ] ⏳ Create API documentation (OpenAPI/Swagger)
- [ ] ⏳ Document all endpoints with examples
- [ ] ⏳ Document authentication requirements
- [ ] ⏳ Document error responses
- [ ] ⏳ Document pagination
- [ ] ⏳ Document filtering options

### 6.2 Developer Documentation
- [ ] ⏳ Create setup guide (README.md)
- [ ] ⏳ Document environment variables
- [ ] ⏳ Document database setup
- [ ] ⏳ Document testing procedures
- [ ] ⏳ Document deployment procedures

### 6.3 Postman Collection
- [ ] ⏳ Create Postman collection for all endpoints
- [ ] ⏳ Add example requests for each endpoint
- [ ] ⏳ Add environment variables
- [ ] ⏳ Add pre-request scripts (auth token)
- [ ] ⏳ Add tests for responses

---

## PHASE 7: DEPLOYMENT PREPARATION

### 7.1 Production Readiness
- [ ] ⏳ Configure production database connection
- [ ] ⏳ Set up environment variables for production
- [ ] ⏳ Configure logging for production
- [ ] ⏳ Configure error tracking
- [ ] ⏳ Set up monitoring

### 7.2 Security Hardening
- [ ] ⏳ Enable HTTPS only
- [ ] ⏳ Configure CORS properly
- [ ] ⏳ Set security headers (helmet)
- [ ] ⏳ Rate limiting
- [ ] ⏳ Input sanitization

---

## VERIFICATION CHECKPOINTS

### Checkpoint 1: After Core Infrastructure
- [ ] ⏳ Database connection works
- [ ] ⏳ Authentication middleware works
- [ ] ⏳ Multi-tenancy middleware works
- [ ] ⏳ Audit trail middleware works
- [ ] ⏳ Error handling works
- [ ] ⏳ Validation utilities work

### Checkpoint 2: After Tier 1 APIs
- [ ] ⏳ All 10 Tier 1 APIs operational
- [ ] ⏳ All APIs tested against live database
- [ ] ⏳ Multi-tenancy verified across all APIs
- [ ] ⏳ Foreign key validation works
- [ ] ⏳ Audit trail works on all tables
- [ ] ⏳ Soft delete works where applicable

### Checkpoint 3: After Tier 2 APIs
- [ ] ⏳ All 16 Tier 2 APIs operational
- [ ] ⏳ All APIs tested against live database
- [ ] ⏳ Integration tests pass
- [ ] ⏳ Security tests pass

### Final Checkpoint: Production Ready
- [ ] ⏳ All 26 APIs operational
- [ ] ⏳ All tests passing
- [ ] ⏳ Documentation complete
- [ ] ⏳ Security audit complete
- [ ] ⏳ Performance acceptable
- [ ] ⏳ Ready for deployment

---

## RISK MITIGATION

### Database Schema Changes
- **Risk:** Database schema might not match expectations
- **Mitigation:** Query schema before implementing each API
- **Verification:** Run schema verification script regularly

### Multi-Tenancy Bugs
- **Risk:** Accidentally expose other users' data
- **Mitigation:** Automated tests for every endpoint
- **Verification:** Manual security review + automated tests

### Foreign Key Issues
- **Risk:** Invalid FK references crash the API
- **Mitigation:** Validate all FKs before INSERT/UPDATE
- **Verification:** Test with invalid FKs

### Performance Issues
- **Risk:** Large datasets cause timeouts
- **Mitigation:** Implement pagination, indexing
- **Verification:** Load testing with production-sized data

---

## SUCCESS CRITERIA

- [ ] ⏳ All 26 APIs operational
- [ ] ⏳ 100% multi-tenancy enforcement
- [ ] ⏳ 100% audit trail coverage
- [ ] ⏳ Zero cross-user data leaks
- [ ] ⏳ All tests passing
- [ ] ⏳ API response time < 200ms for simple queries
- [ ] ⏳ API response time < 1s for complex queries
- [ ] ⏳ Documentation complete
- [ ] ⏳ Security audit passed

---

**Total Tasks:** ~250 individual tasks
**Estimated Time:** 3-4 weeks for Tier 1, 2-3 weeks for Tier 2
**Priority:** Complete Tier 1 first (MVP), then Tier 2
