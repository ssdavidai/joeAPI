/**
 * JoeAPI MCP Server for Smithery
 *
 * Exposes JoeAPI construction management system as MCP tools via Smithery.
 * Allows Claude and other AI assistants to interact with:
 * - Clients, Contacts, SubContractors
 * - Proposals, ProposalLines, Estimates
 * - ProjectManagements, ProjectSchedules, ProjectScheduleTasks
 * - ActionItems with nested resources (Comments, Supervisors, Cost/Schedule Changes)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Configuration schema for Smithery
export const configSchema = z.object({
  JOEAPI_BASE_URL: z
    .string()
    .url()
    .default('http://localhost:8080')
    .describe('Base URL for JoeAPI server'),
});

// Helper function to call JoeAPI
async function callJoeAPI(baseUrl: string, endpoint: string, options: RequestInit = {}) {
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`JoeAPI error (${response.status}): ${error}`);
  }

  return await response.json();
}

// Define all MCP tools for JoeAPI
const tools: Tool[] = [
  // ===== CLIENTS =====
  {
    name: 'list_clients',
    description: 'Get paginated list of clients (multi-tenant, filtered by user)',
    annotations: { category: 'Clients', subcategory: 'Query' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        search: { type: 'string', description: 'Search term for name, email, or company' },
      },
    },
  },
  {
    name: 'get_client',
    description: 'Get a specific client by ID',
    annotations: { category: 'Clients', subcategory: 'Query' },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Client ID (GUID)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_client',
    description: 'Create a new client',
    annotations: { category: 'Clients', subcategory: 'Mutation' },
    inputSchema: {
      type: 'object',
      properties: {
        Name: { type: 'string', description: 'Client name' },
        EmailAddress: { type: 'string', description: 'Email address (required)' },
        CompanyName: { type: 'string', description: 'Company name' },
        Phone: { type: 'string', description: 'Phone number' },
        Address: { type: 'string', description: 'Street address' },
        City: { type: 'string', description: 'City' },
        State: { type: 'string', description: 'State' },
      },
      required: ['Name', 'EmailAddress'],
    },
  },

  // ===== CONTACTS =====
  {
    name: 'list_contacts',
    description: 'Get paginated list of contacts',
    annotations: { category: 'Contacts', subcategory: 'Query' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        search: { type: 'string', description: 'Search term' },
        includeInactive: { type: 'boolean', description: 'Include inactive contacts' },
      },
    },
  },
  {
    name: 'create_contact',
    description: 'Create a new contact',
    annotations: { category: 'Contacts', subcategory: 'Mutation' },
    inputSchema: {
      type: 'object',
      properties: {
        Name: { type: 'string', description: 'Contact name' },
        Email: { type: 'string', description: 'Email address' },
        Phone: { type: 'string', description: 'Phone number' },
        Address: { type: 'string', description: 'Street address' },
        City: { type: 'string', description: 'City' },
        State: { type: 'string', description: 'State' },
      },
      required: ['Name'],
    },
  },

  // ===== SUBCONTRACTORS =====
  {
    name: 'list_subcontractors',
    description: 'Get paginated list of subcontractors',
    annotations: { category: 'Subcontractors', subcategory: 'Query' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        search: { type: 'string', description: 'Search term' },
        category: { type: 'string', description: 'Filter by category (e.g., Plumbing, Electrical)' },
        includeInactive: { type: 'boolean', description: 'Include inactive subcontractors' },
      },
    },
  },

  // ===== PROPOSALS =====
  {
    name: 'list_proposals',
    description: 'Get paginated list of proposals',
    annotations: { category: 'Proposals', subcategory: 'Query' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        clientId: { type: 'string', description: 'Filter by client ID (GUID)' },
        includeDeleted: { type: 'boolean', description: 'Include soft-deleted proposals' },
        includeArchived: { type: 'boolean', description: 'Include archived proposals' },
      },
    },
  },
  {
    name: 'get_proposal',
    description: 'Get a specific proposal by ID',
    annotations: { category: 'Proposals', subcategory: 'Query' },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Proposal ID (GUID)' },
      },
      required: ['id'],
    },
  },

  // ===== PROPOSAL LINES =====
  {
    name: 'list_proposal_lines',
    description: 'Get proposal line items',
    annotations: { category: 'Proposals', subcategory: 'Query' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        proposalId: { type: 'string', description: 'Filter by proposal ID (GUID)' },
      },
    },
  },

  // ===== ESTIMATES =====
  {
    name: 'list_estimates',
    description: 'Get paginated list of estimates',
    annotations: { category: 'Estimates', subcategory: 'Query' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
      },
    },
  },

  // ===== ACTION ITEMS =====
  {
    name: 'list_action_items',
    description: 'Get paginated list of action items',
    annotations: { category: 'ActionItems', subcategory: 'Query' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        projectId: { type: 'string', description: 'Filter by project ID (GUID)' },
        includeDeleted: { type: 'boolean', description: 'Include soft-deleted items' },
        includeArchived: { type: 'boolean', description: 'Include archived items' },
      },
    },
  },
  {
    name: 'get_action_item',
    description: 'Get a specific action item by ID with all nested data (comments, supervisors, cost/schedule changes)',
    annotations: { category: 'ActionItems', subcategory: 'Query' },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Action item ID (integer)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_action_item',
    description: 'Create a new action item with optional nested data (cost change, schedule change, supervisors, initial comment)',
    annotations: { category: 'ActionItems', subcategory: 'Mutation' },
    inputSchema: {
      type: 'object',
      properties: {
        Title: { type: 'string', description: 'Action item title' },
        Description: { type: 'string', description: 'Detailed description' },
        ProjectId: { type: 'string', description: 'Related project ID (optional, GUID)' },
        ActionTypeId: { type: 'number', description: 'Action type ID (1=Cost Change, 2=Schedule Change, 5=Note, etc.)' },
        DueDate: { type: 'string', description: 'Due date (ISO 8601 format)' },
        Status: { type: 'number', description: 'Status code (1=Open, 2=In Progress, etc.)' },
        Source: { type: 'number', description: 'Source code (1=Manual)' },
        CostChange: {
          type: 'object',
          description: 'Cost change data (only for ActionTypeId=1)',
          properties: {
            Amount: { type: 'number', description: 'Cost change amount' },
            EstimateCategoryId: { type: 'string', description: 'Estimate category ID (GUID)' },
            RequiresClientApproval: { type: 'boolean', description: 'Requires client approval (default: true)' },
          },
        },
        ScheduleChange: {
          type: 'object',
          description: 'Schedule change data (only for ActionTypeId=2)',
          properties: {
            NoOfDays: { type: 'number', description: 'Number of days to adjust schedule' },
            ConstructionTaskId: { type: 'string', description: 'Construction task ID (GUID)' },
            RequiresClientApproval: { type: 'boolean', description: 'Requires client approval (default: true)' },
          },
        },
        SupervisorIds: {
          type: 'array',
          description: 'Array of supervisor IDs to assign',
          items: { type: 'number', description: 'User ID' },
        },
        InitialComment: { type: 'string', description: 'Initial comment for the action item' },
      },
      required: ['Title', 'Description', 'ActionTypeId', 'DueDate', 'Status', 'Source'],
    },
  },

  // ===== ACTION ITEM COMMENTS =====
  {
    name: 'list_action_item_comments',
    description: 'Get all comments for an action item',
    annotations: { category: 'ActionItems', subcategory: 'Comments' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
      },
      required: ['actionItemId'],
    },
  },
  {
    name: 'create_action_item_comment',
    description: 'Add a comment to an action item',
    annotations: { category: 'ActionItems', subcategory: 'Comments' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
        Comment: { type: 'string', description: 'Comment text' },
      },
      required: ['actionItemId', 'Comment'],
    },
  },
  {
    name: 'update_action_item_comment',
    description: 'Update an existing comment',
    annotations: { category: 'ActionItems', subcategory: 'Comments' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
        commentId: { type: 'number', description: 'Comment ID' },
        Comment: { type: 'string', description: 'Updated comment text' },
      },
      required: ['actionItemId', 'commentId', 'Comment'],
    },
  },
  {
    name: 'delete_action_item_comment',
    description: 'Delete a comment from an action item',
    annotations: { category: 'ActionItems', subcategory: 'Comments' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
        commentId: { type: 'number', description: 'Comment ID' },
      },
      required: ['actionItemId', 'commentId'],
    },
  },

  // ===== ACTION ITEM SUPERVISORS =====
  {
    name: 'list_action_item_supervisors',
    description: 'Get all supervisors assigned to an action item',
    annotations: { category: 'ActionItems', subcategory: 'Supervisors' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
      },
      required: ['actionItemId'],
    },
  },
  {
    name: 'assign_action_item_supervisor',
    description: 'Assign a supervisor to an action item',
    annotations: { category: 'ActionItems', subcategory: 'Supervisors' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
        SupervisorId: { type: 'number', description: 'Supervisor user ID' },
      },
      required: ['actionItemId', 'SupervisorId'],
    },
  },
  {
    name: 'remove_action_item_supervisor',
    description: 'Remove a supervisor from an action item',
    annotations: { category: 'ActionItems', subcategory: 'Supervisors' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
        supervisorAssignmentId: { type: 'string', description: 'Supervisor assignment ID (GUID)' },
      },
      required: ['actionItemId', 'supervisorAssignmentId'],
    },
  },

  // ===== ACTION ITEM COST CHANGE =====
  {
    name: 'get_action_item_cost_change',
    description: 'Get cost change data for an action item (ActionTypeId=1 only)',
    annotations: { category: 'ActionItems', subcategory: 'Cost Changes' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
      },
      required: ['actionItemId'],
    },
  },
  {
    name: 'create_action_item_cost_change',
    description: 'Add cost change data to an action item (ActionTypeId=1 only)',
    annotations: { category: 'ActionItems', subcategory: 'Cost Changes' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
        Amount: { type: 'number', description: 'Cost change amount' },
        EstimateCategoryId: { type: 'string', description: 'Estimate category ID (GUID)' },
        RequiresClientApproval: { type: 'boolean', description: 'Requires client approval' },
      },
      required: ['actionItemId', 'Amount', 'EstimateCategoryId'],
    },
  },
  {
    name: 'update_action_item_cost_change',
    description: 'Update cost change data for an action item',
    annotations: { category: 'ActionItems', subcategory: 'Cost Changes' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
        Amount: { type: 'number', description: 'Cost change amount' },
        EstimateCategoryId: { type: 'string', description: 'Estimate category ID (GUID)' },
        RequiresClientApproval: { type: 'boolean', description: 'Requires client approval' },
      },
      required: ['actionItemId'],
    },
  },
  {
    name: 'delete_action_item_cost_change',
    description: 'Delete cost change data from an action item',
    annotations: { category: 'ActionItems', subcategory: 'Cost Changes' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
      },
      required: ['actionItemId'],
    },
  },

  // ===== ACTION ITEM SCHEDULE CHANGE =====
  {
    name: 'get_action_item_schedule_change',
    description: 'Get schedule change data for an action item (ActionTypeId=2 only)',
    annotations: { category: 'ActionItems', subcategory: 'Schedule Changes' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
      },
      required: ['actionItemId'],
    },
  },
  {
    name: 'create_action_item_schedule_change',
    description: 'Add schedule change data to an action item (ActionTypeId=2 only)',
    annotations: { category: 'ActionItems', subcategory: 'Schedule Changes' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
        NoOfDays: { type: 'number', description: 'Number of days to adjust schedule' },
        ConstructionTaskId: { type: 'string', description: 'Construction task ID (GUID)' },
        RequiresClientApproval: { type: 'boolean', description: 'Requires client approval' },
      },
      required: ['actionItemId', 'NoOfDays', 'ConstructionTaskId'],
    },
  },
  {
    name: 'update_action_item_schedule_change',
    description: 'Update schedule change data for an action item',
    annotations: { category: 'ActionItems', subcategory: 'Schedule Changes' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
        NoOfDays: { type: 'number', description: 'Number of days to adjust schedule' },
        ConstructionTaskId: { type: 'string', description: 'Construction task ID (GUID)' },
        RequiresClientApproval: { type: 'boolean', description: 'Requires client approval' },
      },
      required: ['actionItemId'],
    },
  },
  {
    name: 'delete_action_item_schedule_change',
    description: 'Delete schedule change data from an action item',
    annotations: { category: 'ActionItems', subcategory: 'Schedule Changes' },
    inputSchema: {
      type: 'object',
      properties: {
        actionItemId: { type: 'number', description: 'Action item ID' },
      },
      required: ['actionItemId'],
    },
  },

  // ===== PROJECT SCHEDULES =====
  {
    name: 'list_project_schedules',
    description: 'Get paginated list of project schedules',
    annotations: { category: 'Projects', subcategory: 'Schedules' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
      },
    },
  },

  // ===== PROJECT SCHEDULE TASKS =====
  {
    name: 'list_project_schedule_tasks',
    description: 'Get project schedule tasks',
    annotations: { category: 'Projects', subcategory: 'Tasks' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        scheduleId: { type: 'string', description: 'Filter by schedule ID (GUID)' },
      },
    },
  },

  // ===== PROJECT MANAGEMENTS =====
  {
    name: 'list_project_managements',
    description: 'Get paginated list of project managements',
    annotations: { category: 'Projects', subcategory: 'Management' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
      },
    },
  },

  // ===== TIER 2: FINANCIAL & ANALYTICS =====

  // ===== TRANSACTIONS =====
  {
    name: 'list_transactions',
    description: 'Get QB transaction history with filters for project, account, date range, and transaction type',
    annotations: { category: 'Financial', subcategory: 'Transactions' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        projectId: { type: 'string', description: 'Filter by project ID (GUID)' },
        accountId: { type: 'string', description: 'Filter by account ID (GUID)' },
        startDate: { type: 'string', description: 'Start date filter (ISO 8601 format)' },
        endDate: { type: 'string', description: 'End date filter (ISO 8601 format)' },
        transactionType: { type: 'string', description: 'Filter by transaction type (e.g., Bill, Check, Receipt)' },
      },
    },
  },
  {
    name: 'get_transaction_summary',
    description: 'Get aggregated transaction summaries grouped by project, account, vendor, or month',
    annotations: { category: 'Financial', subcategory: 'Transactions' },
    inputSchema: {
      type: 'object',
      properties: {
        groupBy: { type: 'string', description: 'Group by: project, account, vendor, or month' },
        projectId: { type: 'string', description: 'Filter by project ID (GUID)' },
        startDate: { type: 'string', description: 'Start date filter (ISO 8601 format)' },
        endDate: { type: 'string', description: 'End date filter (ISO 8601 format)' },
      },
      required: ['groupBy'],
    },
  },

  // ===== JOB BALANCES =====
  {
    name: 'list_job_balances',
    description: 'Get job-level financial balances showing current balance, receivables, and collected amounts',
    annotations: { category: 'Financial', subcategory: 'Job Balances' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        projectId: { type: 'string', description: 'Filter by specific project ID (GUID)' },
      },
    },
  },

  // ===== COST VARIANCE =====
  {
    name: 'get_cost_variance',
    description: 'Calculate cost variance by comparing original/revised estimates against actual costs from transactions',
    annotations: { category: 'Analytics', subcategory: 'Cost Analysis' },
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Filter by project ID (GUID)' },
        categoryId: { type: 'string', description: 'Filter by estimate category ID (GUID)' },
      },
    },
  },

  // ===== INVOICES =====
  {
    name: 'list_invoices',
    description: 'Get paginated list of invoices with filtering by client, status, and date range',
    annotations: { category: 'Financial', subcategory: 'Invoices' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        clientId: { type: 'string', description: 'Filter by client ID (GUID)' },
        status: { type: 'string', description: 'Filter by status (e.g., Paid, Unpaid, Overdue)' },
        startDate: { type: 'string', description: 'Start date filter (ISO 8601 format)' },
        endDate: { type: 'string', description: 'End date filter (ISO 8601 format)' },
      },
    },
  },
  {
    name: 'get_invoice',
    description: 'Get a specific invoice by ID with all line items',
    annotations: { category: 'Financial', subcategory: 'Invoices' },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Invoice ID (GUID)' },
      },
      required: ['id'],
    },
  },

  // ===== SCHEDULE REVISIONS =====
  {
    name: 'list_schedule_revisions',
    description: 'Get schedule revision history showing how schedules have changed over time',
    annotations: { category: 'Projects', subcategory: 'Schedule Tracking' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        projectId: { type: 'string', description: 'Filter by project ID (GUID)' },
      },
    },
  },
  {
    name: 'get_schedule_revision',
    description: 'Get a specific schedule revision by ID with all revision items',
    annotations: { category: 'Projects', subcategory: 'Schedule Tracking' },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Schedule revision ID (GUID)' },
      },
      required: ['id'],
    },
  },

  // ===== PROJECT DETAILS =====
  {
    name: 'get_project_details',
    description: 'Get comprehensive project overview combining schedule, financial status, team, and recent activity',
    annotations: { category: 'Projects', subcategory: 'Overview' },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Project ID (GUID)' },
      },
      required: ['id'],
    },
  },

  // ===== PROPOSAL PIPELINE =====
  {
    name: 'get_proposal_pipeline',
    description: 'Get sales pipeline analytics including conversion rates, proposal status breakdown, and recent activity',
    annotations: { category: 'Analytics', subcategory: 'Sales Pipeline' },
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date filter (ISO 8601 format)' },
        endDate: { type: 'string', description: 'End date filter (ISO 8601 format)' },
      },
    },
  },

  // ===== ESTIMATE REVISIONS =====
  {
    name: 'get_estimate_revision_history',
    description: 'Get estimate revision history showing how estimates changed and calculate average overage percentage',
    annotations: { category: 'Analytics', subcategory: 'Cost Analysis' },
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Filter by project ID (GUID)' },
      },
    },
  },

  // ===== COST REVISIONS =====
  {
    name: 'list_cost_revisions',
    description: 'Get detailed cost revision history from the CostRevisions table',
    annotations: { category: 'Analytics', subcategory: 'Cost Analysis' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        projectId: { type: 'string', description: 'Filter by project ID (GUID)' },
      },
    },
  },
  {
    name: 'get_cost_revision',
    description: 'Get a specific cost revision by ID with all revision items',
    annotations: { category: 'Analytics', subcategory: 'Cost Analysis' },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Cost revision ID (GUID)' },
      },
      required: ['id'],
    },
  },

  // ===== DEPOSITS =====
  {
    name: 'list_deposits',
    description: 'Get deposit/retainer tracking with usage calculations and threshold alerts',
    annotations: { category: 'Financial', subcategory: 'Deposits' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
        projectId: { type: 'string', description: 'Filter by project ID (GUID)' },
      },
    },
  },
  {
    name: 'get_deposit_by_project',
    description: 'Get deposit details for a specific project',
    annotations: { category: 'Financial', subcategory: 'Deposits' },
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID (GUID)' },
      },
      required: ['projectId'],
    },
  },

  // ===== PROPOSAL TEMPLATE PRICING =====
  {
    name: 'get_proposal_template_pricing',
    description: 'Get standard pricing templates for estimates across all categories',
    annotations: { category: 'Proposals', subcategory: 'Templates' },
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20, max: 100)' },
      },
    },
  },
  {
    name: 'get_proposal_template_pricing_by_id',
    description: 'Get pricing template for a specific proposal template ID',
    annotations: { category: 'Proposals', subcategory: 'Templates' },
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Proposal template ID (GUID)' },
      },
      required: ['id'],
    },
  },
];

// Default export: function that creates the MCP server
export default function createServer({ config }: { config: z.infer<typeof configSchema> }) {
  const baseUrl = config.JOEAPI_BASE_URL;

  // Create MCP server
  const server = new Server(
    {
      name: 'joeapi-mcp',
      version: '1.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result: any;

      switch (name) {
        // ===== CLIENTS =====
        case 'list_clients': {
          const { page = 1, limit = 20, search = '' } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(search && { search }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/clients?${queryParams}`);
          break;
        }

        case 'get_client': {
          const { id } = args as { id: string };
          result = await callJoeAPI(baseUrl, `/api/v1/clients/${id}`);
          break;
        }

        case 'create_client': {
          result = await callJoeAPI(baseUrl, '/api/v1/clients', {
            method: 'POST',
            body: JSON.stringify(args),
          });
          break;
        }

        // ===== CONTACTS =====
        case 'list_contacts': {
          const { page = 1, limit = 20, search = '', includeInactive = false } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(search && { search }),
            includeInactive: String(includeInactive),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/contacts?${queryParams}`);
          break;
        }

        case 'create_contact': {
          result = await callJoeAPI(baseUrl, '/api/v1/contacts', {
            method: 'POST',
            body: JSON.stringify(args),
          });
          break;
        }

        // ===== SUBCONTRACTORS =====
        case 'list_subcontractors': {
          const { page = 1, limit = 20, search = '', category = '', includeInactive = false } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(search && { search }),
            ...(category && { category }),
            includeInactive: String(includeInactive),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/subcontractors?${queryParams}`);
          break;
        }

        // ===== PROPOSALS =====
        case 'list_proposals': {
          const { page = 1, limit = 20, clientId = '', includeDeleted = false, includeArchived = false } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(clientId && { clientId }),
            includeDeleted: String(includeDeleted),
            includeArchived: String(includeArchived),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/proposals?${queryParams}`);
          break;
        }

        case 'get_proposal': {
          const { id } = args as { id: string };
          result = await callJoeAPI(baseUrl, `/api/v1/proposals/${id}`);
          break;
        }

        // ===== PROPOSAL LINES =====
        case 'list_proposal_lines': {
          const { page = 1, limit = 20, proposalId = '' } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(proposalId && { proposalId }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/proposallines?${queryParams}`);
          break;
        }

        // ===== ESTIMATES =====
        case 'list_estimates': {
          const { page = 1, limit = 20 } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/estimates?${queryParams}`);
          break;
        }

        // ===== ACTION ITEMS =====
        case 'list_action_items': {
          const { page = 1, limit = 20, projectId = '', includeDeleted = false, includeArchived = false } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(projectId && { projectId }),
            includeDeleted: String(includeDeleted),
            includeArchived: String(includeArchived),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems?${queryParams}`);
          break;
        }

        case 'get_action_item': {
          const { id } = args as { id: number };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${id}`);
          break;
        }

        case 'create_action_item': {
          result = await callJoeAPI(baseUrl, '/api/v1/actionitems', {
            method: 'POST',
            body: JSON.stringify(args),
          });
          break;
        }

        // ===== ACTION ITEM COMMENTS =====
        case 'list_action_item_comments': {
          const { actionItemId } = args as { actionItemId: number };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/comments`);
          break;
        }

        case 'create_action_item_comment': {
          const { actionItemId, Comment } = args as { actionItemId: number; Comment: string };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ Comment }),
          });
          break;
        }

        case 'update_action_item_comment': {
          const { actionItemId, commentId, Comment } = args as { actionItemId: number; commentId: number; Comment: string };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify({ Comment }),
          });
          break;
        }

        case 'delete_action_item_comment': {
          const { actionItemId, commentId } = args as { actionItemId: number; commentId: number };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/comments/${commentId}`, {
            method: 'DELETE',
          });
          break;
        }

        // ===== ACTION ITEM SUPERVISORS =====
        case 'list_action_item_supervisors': {
          const { actionItemId } = args as { actionItemId: number };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/supervisors`);
          break;
        }

        case 'assign_action_item_supervisor': {
          const { actionItemId, SupervisorId } = args as { actionItemId: number; SupervisorId: number };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/supervisors`, {
            method: 'POST',
            body: JSON.stringify({ SupervisorId }),
          });
          break;
        }

        case 'remove_action_item_supervisor': {
          const { actionItemId, supervisorAssignmentId } = args as { actionItemId: number; supervisorAssignmentId: string };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/supervisors/${supervisorAssignmentId}`, {
            method: 'DELETE',
          });
          break;
        }

        // ===== ACTION ITEM COST CHANGE =====
        case 'get_action_item_cost_change': {
          const { actionItemId } = args as { actionItemId: number };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/costchange`);
          break;
        }

        case 'create_action_item_cost_change': {
          const { actionItemId, Amount, EstimateCategoryId, RequiresClientApproval } = args as any;
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/costchange`, {
            method: 'POST',
            body: JSON.stringify({ Amount, EstimateCategoryId, RequiresClientApproval }),
          });
          break;
        }

        case 'update_action_item_cost_change': {
          const { actionItemId, ...updateData } = args as any;
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/costchange`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
          });
          break;
        }

        case 'delete_action_item_cost_change': {
          const { actionItemId } = args as { actionItemId: number };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/costchange`, {
            method: 'DELETE',
          });
          break;
        }

        // ===== ACTION ITEM SCHEDULE CHANGE =====
        case 'get_action_item_schedule_change': {
          const { actionItemId } = args as { actionItemId: number };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/schedulechange`);
          break;
        }

        case 'create_action_item_schedule_change': {
          const { actionItemId, NoOfDays, ConstructionTaskId, RequiresClientApproval } = args as any;
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/schedulechange`, {
            method: 'POST',
            body: JSON.stringify({ NoOfDays, ConstructionTaskId, RequiresClientApproval }),
          });
          break;
        }

        case 'update_action_item_schedule_change': {
          const { actionItemId, ...updateData } = args as any;
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/schedulechange`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
          });
          break;
        }

        case 'delete_action_item_schedule_change': {
          const { actionItemId } = args as { actionItemId: number };
          result = await callJoeAPI(baseUrl, `/api/v1/actionitems/${actionItemId}/schedulechange`, {
            method: 'DELETE',
          });
          break;
        }

        // ===== PROJECT SCHEDULES =====
        case 'list_project_schedules': {
          const { page = 1, limit = 20 } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/projectschedules?${queryParams}`);
          break;
        }

        // ===== PROJECT SCHEDULE TASKS =====
        case 'list_project_schedule_tasks': {
          const { page = 1, limit = 20, scheduleId = '' } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(scheduleId && { scheduleId }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/projectscheduletasks?${queryParams}`);
          break;
        }

        // ===== PROJECT MANAGEMENTS =====
        case 'list_project_managements': {
          const { page = 1, limit = 20 } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/projectmanagements?${queryParams}`);
          break;
        }

        // ===== TIER 2: FINANCIAL & ANALYTICS =====

        // ===== TRANSACTIONS =====
        case 'list_transactions': {
          const { page = 1, limit = 20, projectId = '', accountId = '', startDate = '', endDate = '', transactionType = '' } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(projectId && { projectId }),
            ...(accountId && { accountId }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
            ...(transactionType && { transactionType }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/transactions?${queryParams}`);
          break;
        }

        case 'get_transaction_summary': {
          const { groupBy, projectId = '', startDate = '', endDate = '' } = args as any;
          const queryParams = new URLSearchParams({
            groupBy,
            ...(projectId && { projectId }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/transactions/summary?${queryParams}`);
          break;
        }

        // ===== JOB BALANCES =====
        case 'list_job_balances': {
          const { page = 1, limit = 20, projectId = '' } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(projectId && { projectId }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/job-balances?${queryParams}`);
          break;
        }

        // ===== COST VARIANCE =====
        case 'get_cost_variance': {
          const { projectId = '', categoryId = '' } = args as any;
          const queryParams = new URLSearchParams({
            ...(projectId && { projectId }),
            ...(categoryId && { categoryId }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/cost-variance?${queryParams}`);
          break;
        }

        // ===== INVOICES =====
        case 'list_invoices': {
          const { page = 1, limit = 20, clientId = '', status = '', startDate = '', endDate = '' } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(clientId && { clientId }),
            ...(status && { status }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/invoices?${queryParams}`);
          break;
        }

        case 'get_invoice': {
          const { id } = args as { id: string };
          result = await callJoeAPI(baseUrl, `/api/v1/invoices/${id}`);
          break;
        }

        // ===== SCHEDULE REVISIONS =====
        case 'list_schedule_revisions': {
          const { page = 1, limit = 20, projectId = '' } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(projectId && { projectId }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/schedule-revisions?${queryParams}`);
          break;
        }

        case 'get_schedule_revision': {
          const { id } = args as { id: string };
          result = await callJoeAPI(baseUrl, `/api/v1/schedule-revisions/${id}`);
          break;
        }

        // ===== PROJECT DETAILS =====
        case 'get_project_details': {
          const { id } = args as { id: string };
          result = await callJoeAPI(baseUrl, `/api/v1/projects/${id}/details`);
          break;
        }

        // ===== PROPOSAL PIPELINE =====
        case 'get_proposal_pipeline': {
          const { startDate = '', endDate = '' } = args as any;
          const queryParams = new URLSearchParams({
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/proposals/pipeline?${queryParams}`);
          break;
        }

        // ===== ESTIMATE REVISIONS =====
        case 'get_estimate_revision_history': {
          const { projectId = '' } = args as any;
          const queryParams = new URLSearchParams({
            ...(projectId && { projectId }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/estimates/revision-history?${queryParams}`);
          break;
        }

        // ===== COST REVISIONS =====
        case 'list_cost_revisions': {
          const { page = 1, limit = 20, projectId = '' } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(projectId && { projectId }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/cost-revisions?${queryParams}`);
          break;
        }

        case 'get_cost_revision': {
          const { id } = args as { id: string };
          result = await callJoeAPI(baseUrl, `/api/v1/cost-revisions/${id}`);
          break;
        }

        // ===== DEPOSITS =====
        case 'list_deposits': {
          const { page = 1, limit = 20, projectId = '' } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(projectId && { projectId }),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/deposits?${queryParams}`);
          break;
        }

        case 'get_deposit_by_project': {
          const { projectId } = args as { projectId: string };
          result = await callJoeAPI(baseUrl, `/api/v1/deposits/${projectId}`);
          break;
        }

        // ===== PROPOSAL TEMPLATE PRICING =====
        case 'get_proposal_template_pricing': {
          const { page = 1, limit = 20 } = args as any;
          const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
          });
          result = await callJoeAPI(baseUrl, `/api/v1/proposal-templates/pricing?${queryParams}`);
          break;
        }

        case 'get_proposal_template_pricing_by_id': {
          const { id } = args as { id: string };
          result = await callJoeAPI(baseUrl, `/api/v1/proposal-templates/${id}/pricing`);
          break;
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
