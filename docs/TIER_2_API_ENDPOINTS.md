# Tier 2 API Endpoints Specification

**Purpose:** Define database-backed API endpoints to replace "missing" tools in joetasks.json

**Database:** chaconstruction-test (99 tables, 319,767 total records)

---

## Overview

This document specifies **Tier 2 API endpoints** - database operations that can replace the "missing" tools identified in `joetasks.json`. These endpoints leverage existing database tables to provide financial tracking, cost management, payment history, and project analytics.

### Scope

Focus on **database-backed operations only**. External integrations (weather APIs, email services, SMS, etc.) are out of scope.

---

## Missing Tools That Can Be Replaced

From `joetasks.json` analysis, the following missing tools require database operations:

### Financial & Cost Tracking
- `ACCOUNTS_RECEIVABLE_SYSTEM`
- `ACTUAL_COST_SYSTEM` / `ACTUAL_COST_TRACKING_SYSTEM`
- `COST_TRACKING_SYSTEM`
- `COST_BREAKDOWN_SYSTEM`
- `COST_HISTORY_SYSTEM`
- `PAYMENT_COLLECTION_SYSTEM`
- `PAYMENT_HISTORY_SYSTEM`
- `PAYMENT_SCHEDULE_SYSTEM`
- `DEPOSIT_TRACKING_SYSTEM`
- `RETAINER_TRACKING_SYSTEM`

### Project & Schedule Management
- `UPDATE_PROJECT_SCHEDULE_TASK` (update operation)
- `DURATION_TRACKING_SYSTEM`
- `PROJECT_DETAILS_SYSTEM`

### Reporting & Analytics
- `COST_VARIANCE_CALCULATOR`
- `BUDGET_VARIANCE_CALCULATOR`
- `DEPOSIT_BALANCE_CALCULATOR`
- `RECEIVABLES_CALCULATOR`
- `PIPELINE_ANALYTICS`
- `REVISION_HISTORY_ANALYZER`
- `REVISION_TRACKING_SYSTEM`

### Product & Pricing
- `PRODUCT_PRICING_DATABASE`
- `UPGRADE_CALCULATOR`
- `LANDSCAPE_PRICING_CALCULATOR`
- `HARDSCAPE_PRICING_CALCULATOR`

### Communication & Documents
- `CONVERSATION_TRACKING_SYSTEM` (if using existing tables)
- `COMMUNICATION_LOG`
- `PHOTO_STORAGE_SYSTEM` (if using existing tables)

---

## Database Tables Available

### Core Financial Tables
- **QBTransactions** (261,380 rows) - All QuickBooks transactions
- **QBAccounts** (830 rows) - Chart of accounts
- **QBCustomers** (1,252 rows) - Customer data
- **QBVendors** (2,077 rows) - Vendor data
- **QBJournalEntries** (789 rows) - Journal entries
- **Invoices** (84 rows) - Custom invoices
- **InvoiceItems** (117 rows) - Invoice line items
- **JobBalances** (48 rows) - Job-level balances
- **ChangeOrders** (15 rows) - Change order records

### Cost & Estimate Tables
- **Estimates** (193 rows) - Project estimates
- **EstimateCategories** (624 rows) - Estimate line item categories
- **EstimateMappings** (709 rows) - QB account mappings
- **ActionItemCostChange** (21 rows) - Cost change action items
- **CostRevisions** (35 rows) - Cost revision headers
- **CostRevisionItems** (155 rows) - Cost revision details

### Project & Schedule Tables
- **ProjectSchedules** (38 rows) - Project schedules
- **ProjectScheduleTasks** (1,724 rows) - Scheduled tasks with dates
- **ProjectScheduleDelays** (12 rows) - Delay tracking
- **ScheduleRevisions** (11 rows) - Schedule revision headers
- **ScheduleRevisionItems** (11 rows) - Schedule revision details
- **ActionItemScheduleChange** (0 rows) - Schedule change action items
- **ProjectManagements** (0 rows) - Project management data
- **ProjectTotals** (108 rows) - Project totals/summaries
- **ProjectJournal** (180 rows) - Project journal entries

### Proposal & Contract Tables
- **Proposals** (820 rows) - Proposals/estimates
- **ProposalLines** (26,559 rows) - Proposal line items with amounts
- **ProposalProjects** (392 rows) - Project details
- **ProposalTemplates** (27 rows) - Proposal templates
- **ProposalTemplatesLineItems** (1,329 rows) - Template pricing
- **Contract** (3 rows) - Contract templates

### Client & Communication Tables
- **Clients** (83 rows) - Client contact info
- **Contacts** (1 rows) - Additional contacts
- **ClientDocuments** (603 rows) - Uploaded documents
- **ProjectNotes** (2 rows) - Project notes
- **ActionItemComments** (15 rows) - Action item discussions

### Subcontractor & Vendor Tables
- **SubContractors** (34 rows) - Subcontractor details
- **SubContractorCategories** (84 rows) - Trade categories
- **ProjectSubContractors** (21 rows) - Project-subcontractor assignments
- **Vendors** (1 rows) - Vendor details

---

## Tier 2 API Endpoint Specifications

### 1. Financial Transactions

#### GET /api/v1/transactions
**Purpose:** Retrieve QuickBooks transactions with filtering
**Database Table:** `QBTransactions`
**Parameters:**
- `projectId` (GUID) - Filter by QBClassId
- `accountId` (GUID) - Filter by account
- `startDate` (date) - Filter by date range
- `endDate` (date) - Filter by date range
- `transactionType` (string) - Filter by type (invoice, bill, payment, etc.)
- `page` (int) - Pagination
- `limit` (int) - Page size

**Response:** Paginated list of transactions
**Use Cases:**
- ACTUAL_COST_TRACKING_SYSTEM
- COST_HISTORY_SYSTEM
- PAYMENT_HISTORY_SYSTEM

---

#### GET /api/v1/transactions/summary
**Purpose:** Get transaction summary/totals by project or account
**Database:** Aggregate `QBTransactions`
**Parameters:**
- `projectId` (GUID) - Group by project
- `accountId` (GUID) - Group by account
- `groupBy` (string) - Group by: project, account, vendor, month
- `startDate` (date)
- `endDate` (date)

**Response:**
```json
{
  "summary": [
    {
      "groupId": "GUID",
      "groupName": "string",
      "totalDebits": 12345.67,
      "totalCredits": 12345.67,
      "netAmount": 0.00,
      "transactionCount": 150
    }
  ]
}
```

**Use Cases:**
- COST_BREAKDOWN_SYSTEM
- ACCOUNTS_RECEIVABLE_SYSTEM
- ACTUAL_COST_SYSTEM

---

### 2. Job Balances & Receivables

#### GET /api/v1/job-balances
**Purpose:** Get current job balances and receivables
**Database Table:** `JobBalances`
**Parameters:**
- `projectId` (GUID) - Filter by project
- `page` (int)
- `limit` (int)

**Response:**
```json
{
  "data": [
    {
      "projectId": "GUID",
      "projectName": "string",
      "currentBalance": 12345.67,
      "receivables": 5000.00,
      "collected": 7345.67
    }
  ]
}
```

**Use Cases:**
- ACCOUNTS_RECEIVABLE_SYSTEM
- RECEIVABLES_CALCULATOR
- DEPOSIT_TRACKING_SYSTEM

---

#### GET /api/v1/invoices
**Purpose:** List invoices with payment status
**Database Table:** `Invoices` + `InvoiceItems`
**Parameters:**
- `clientId` (GUID)
- `status` (string) - paid, unpaid, overdue
- `startDate` (date)
- `endDate` (date)
- `page` (int)
- `limit` (int)

**Response:** Paginated invoices with line items
**Use Cases:**
- ACCOUNTS_RECEIVABLE_SYSTEM
- PAYMENT_COLLECTION_SYSTEM
- RECEIVABLES_REPORT_GENERATOR

---

### 3. Cost Tracking & Variance

#### GET /api/v1/cost-revisions
**Purpose:** Get cost revision history per project
**Database Tables:** `CostRevisions` + `CostRevisionItems`
**Parameters:**
- `projectId` (GUID)
- `page` (int)
- `limit` (int)

**Response:**
```json
{
  "data": [
    {
      "revisionId": "GUID",
      "revisionNumber": 1,
      "date": "2025-11-12",
      "totalChange": 5000.00,
      "items": [
        {
          "category": "Plumbing",
          "originalAmount": 10000.00,
          "revisedAmount": 12000.00,
          "variance": 2000.00
        }
      ]
    }
  ]
}
```

**Use Cases:**
- REVISION_HISTORY_ANALYZER
- REVISION_TRACKING_SYSTEM
- COST_VARIANCE_CALCULATOR

---

#### GET /api/v1/cost-variance
**Purpose:** Calculate cost variance (actual vs. estimate)
**Database:** `Estimates` + `EstimateCategories` + `ActionItemCostChange` + `QBTransactions`
**Parameters:**
- `projectId` (GUID) - Required
- `categoryId` (GUID) - Optional, filter by category

**Response:**
```json
{
  "projectId": "GUID",
  "projectName": "string",
  "originalEstimate": 50000.00,
  "revisedEstimate": 55000.00,
  "actualCost": 52000.00,
  "variance": -2000.00,
  "variancePercent": -3.64,
  "categories": [
    {
      "categoryId": "GUID",
      "categoryName": "Framing",
      "estimated": 15000.00,
      "actual": 16500.00,
      "variance": -1500.00,
      "variancePercent": -10.0
    }
  ]
}
```

**Use Cases:**
- COST_VARIANCE_CALCULATOR
- BUDGET_VARIANCE_CALCULATOR
- COST_TRACKING_SYSTEM
- REALTIME_COST_DASHBOARD

---

### 4. Schedule Management

#### PUT /api/v1/project-schedule-tasks/:id
**Purpose:** Update project schedule task (dates, duration, etc.)
**Database Table:** `ProjectScheduleTasks`
**Body:**
```json
{
  "startDate": "2025-11-15",
  "endDate": "2025-11-20",
  "duration": 5,
  "sequence": 10
}
```

**Response:** Updated task
**Use Cases:**
- UPDATE_PROJECT_SCHEDULE_TASK

---

#### GET /api/v1/schedule-revisions
**Purpose:** Get schedule revision history
**Database Tables:** `ScheduleRevisions` + `ScheduleRevisionItems`
**Parameters:**
- `projectId` (GUID)
- `page` (int)
- `limit` (int)

**Response:**
```json
{
  "data": [
    {
      "revisionId": "GUID",
      "revisionNumber": 1,
      "date": "2025-11-12",
      "totalDaysAdded": 4,
      "reason": "Weather delay",
      "items": [
        {
          "taskId": "GUID",
          "taskName": "Exterior painting",
          "originalStartDate": "2025-11-10",
          "newStartDate": "2025-11-14",
          "daysChanged": 4
        }
      ]
    }
  ]
}
```

**Use Cases:**
- REVISION_HISTORY_ANALYZER
- DURATION_TRACKING_SYSTEM

---

### 5. Proposal & Estimate Analytics

#### GET /api/v1/proposals/pipeline
**Purpose:** Get proposal pipeline analytics
**Database:** `Proposals` + `ProposalLines` + aggregate data
**Parameters:**
- `status` (string) - pending, accepted, declined
- `startDate` (date)
- `endDate` (date)

**Response:**
```json
{
  "summary": {
    "totalProposals": 820,
    "pendingCount": 45,
    "pendingValue": 1250000.00,
    "acceptedCount": 650,
    "acceptedValue": 8500000.00,
    "declinedCount": 125,
    "conversionRate": 82.0
  },
  "byStatus": [
    {
      "status": "pending",
      "count": 45,
      "totalValue": 1250000.00
    }
  ]
}
```

**Use Cases:**
- PIPELINE_ANALYTICS
- FINANCIAL_PROJECTIONS_ENGINE
- GENERATE_QUEUE_SUMMARY_REPORT

---

#### GET /api/v1/estimates/revision-history
**Purpose:** Get estimate revision history with average overage
**Database:** `Estimates` + `EstimateMappings` + `ActionItemCostChange`
**Parameters:**
- `projectId` (GUID) - Optional
- `page` (int)
- `limit` (int)

**Response:**
```json
{
  "averageOveragePercent": 8.5,
  "totalRevisions": 157,
  "revisions": [
    {
      "projectId": "GUID",
      "projectName": "string",
      "originalEstimate": 50000.00,
      "finalEstimate": 55000.00,
      "overage": 5000.00,
      "overagePercent": 10.0,
      "revisionCount": 3
    }
  ]
}
```

**Use Cases:**
- REVISION_HISTORY_ANALYZER
- TREND_ANALYSIS_REPORT

---

### 6. Product & Pricing

#### GET /api/v1/proposal-templates/pricing
**Purpose:** Get standard pricing from proposal templates
**Database:** `ProposalTemplates` + `ProposalTemplatesLineItems`
**Parameters:**
- `templateId` (GUID) - Optional
- `category` (string) - landscape, hardscape, etc.

**Response:**
```json
{
  "templates": [
    {
      "templateId": "GUID",
      "templateName": "Landscape Standard",
      "items": [
        {
          "itemId": "GUID",
          "name": "Sod Installation",
          "amount": 1.50,
          "unit": "sq ft",
          "category": "Landscape"
        },
        {
          "itemId": "GUID",
          "name": "Irrigation System",
          "amount": 2.25,
          "unit": "sq ft",
          "category": "Landscape"
        }
      ]
    }
  ]
}
```

**Use Cases:**
- PRODUCT_PRICING_DATABASE
- LANDSCAPE_PRICING_CALCULATOR
- HARDSCAPE_PRICING_CALCULATOR
- UPGRADE_CALCULATOR

---

### 7. Project Details & Analytics

#### GET /api/v1/projects/:id/details
**Purpose:** Get comprehensive project details
**Database:** Multiple tables joined (`QBClasses`, `ProjectSchedules`, `ProjectTotals`, `ProjectSupervisors`, `ActionItems`, etc.)
**Response:**
```json
{
  "projectId": "GUID",
  "projectName": "string",
  "client": {...},
  "status": "active",
  "startDate": "2025-01-15",
  "endDate": "2025-06-30",
  "estimatedValue": 150000.00,
  "actualCost": 125000.00,
  "progressPercent": 75.0,
  "supervisors": [...],
  "scheduleStatus": {
    "totalTasks": 45,
    "completedTasks": 30,
    "upcomingTasks": 10,
    "delayedTasks": 5
  },
  "financialStatus": {
    "budgeted": 150000.00,
    "spent": 125000.00,
    "remaining": 25000.00
  }
}
```

**Use Cases:**
- PROJECT_DETAILS_SYSTEM
- WIP_REPORT_GENERATOR

---

### 8. Deposit & Retainer Tracking

#### GET /api/v1/deposits
**Purpose:** Track deposits and retainers with usage
**Database:** Need to identify deposit tracking in `QBTransactions` or `JobBalances`
**Parameters:**
- `projectId` (GUID)
- `page` (int)
- `limit` (int)

**Response:**
```json
{
  "data": [
    {
      "projectId": "GUID",
      "projectName": "string",
      "initialDeposit": 25000.00,
      "totalWithdrawn": 18000.00,
      "currentBalance": 7000.00,
      "percentUsed": 72.0,
      "thresholdReached": false
    }
  ]
}
```

**Use Cases:**
- DEPOSIT_TRACKING_SYSTEM
- DEPOSIT_BALANCE_CALCULATOR
- RETAINER_TRACKING_SYSTEM
- THRESHOLD_MONITORING_SERVICE

---

## MCP Tool Specifications

Each API endpoint above will have a corresponding MCP tool:

### Tool Naming Convention
- API: `GET /api/v1/transactions` → MCP Tool: `list_transactions`
- API: `GET /api/v1/cost-variance` → MCP Tool: `get_cost_variance`
- API: `PUT /api/v1/project-schedule-tasks/:id` → MCP Tool: `update_project_schedule_task`

### MCP Tool Template

```typescript
{
  name: "get_cost_variance",
  description: "Calculate cost variance (actual vs estimate) for a project",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "Project ID (GUID)"
      },
      categoryId: {
        type: "string",
        description: "Optional: Filter by estimate category ID"
      }
    },
    required: ["projectId"]
  }
}
```

---

## Implementation Priority

### Phase 1 (High Priority - Financial Tracking)
1. GET `/api/v1/transactions` + summary
2. GET `/api/v1/job-balances`
3. GET `/api/v1/cost-variance`
4. GET `/api/v1/invoices`

### Phase 2 (Project Management)
5. PUT `/api/v1/project-schedule-tasks/:id`
6. GET `/api/v1/schedule-revisions`
7. GET `/api/v1/projects/:id/details`

### Phase 3 (Analytics & Reporting)
8. GET `/api/v1/proposals/pipeline`
9. GET `/api/v1/estimates/revision-history`
10. GET `/api/v1/cost-revisions`
11. GET `/api/v1/deposits`

### Phase 4 (Pricing & Templates)
12. GET `/api/v1/proposal-templates/pricing`

---

## Database Relationships to Leverage

### For Cost Tracking:
```
QBTransactions → QBClasses (ProjectId)
Estimates → QBClasses (ProjectId)
ActionItemCostChange → ActionItems → QBClasses (ProjectId)
```

### For Schedule Tracking:
```
ProjectSchedules → QBClasses (ProjectId)
ProjectScheduleTasks → ProjectSchedules
ScheduleRevisions → ProjectSchedules
ActionItemScheduleChange → ActionItems
```

### For Proposals & Estimates:
```
Proposals → Clients
Proposals → QBClasses (ProjectId)
ProposalLines → Proposals
ProposalLines → EstimateCategories
```

---

## Next Steps

1. Create API endpoint controllers for Phase 1
2. Implement corresponding MCP tools
3. Update `joetasks.json` to replace missing tools with Tier 2 tools
4. Test integration with existing MCP server
5. Deploy to Fly.io
6. Update Smithery MCP server listing
