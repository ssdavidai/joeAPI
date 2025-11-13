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
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
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

// Define workflow prompts for common construction management tasks
const prompts = [
  {
    name: 'work_in_process_report',
    description: 'Generate a comprehensive work-in-process (WIP) report showing all active projects with completion status, costs vs budget, current balances, and outstanding issues',
    arguments: [
      {
        name: 'format',
        description: 'Output format: summary, detailed, or executive',
        required: false,
      },
    ],
  },
  {
    name: 'detailed_budget_tracking',
    description: 'Report how far a specific job is over/under budget, including amount and percentage variance by category',
    arguments: [
      {
        name: 'projectId',
        description: 'Project ID (GUID) or project name to analyze',
        required: true,
      },
    ],
  },
  {
    name: 'deposit_tracking',
    description: 'Track owner deposits and current balance on specific job accounts, showing initial deposit, draws made, and remaining balance',
    arguments: [
      {
        name: 'projectId',
        description: 'Project ID (GUID) to check deposits for (optional - if not provided, shows all projects)',
        required: false,
      },
    ],
  },
  {
    name: 'cost_to_estimate_report',
    description: 'Provide real-time cost vs. estimate tracking report showing original estimate, revisions, actual costs, and variance analysis',
    arguments: [
      {
        name: 'projectId',
        description: 'Project ID (GUID) or project name (optional - if not provided, shows all projects)',
        required: false,
      },
    ],
  },
  {
    name: 'receivables_report',
    description: 'Generate report on supervision fees collected and outstanding receivables, broken down by client with aging',
    arguments: [],
  },
  {
    name: 'gross_receipts_forecast',
    description: 'Project gross receipts for the coming month based on scheduled invoices, new proposal deposits, and deposit draws',
    arguments: [
      {
        name: 'months',
        description: 'Number of months to forecast (default: 1)',
        required: false,
      },
    ],
  },
  {
    name: 'job_queue_summary',
    description: 'Report on number of homes in queue (pending proposals), under construction (active projects), and upcoming pipeline',
    arguments: [],
  },
  {
    name: 'projected_income',
    description: 'Estimate expected monthly income from active proposals and ongoing projects with payment schedules',
    arguments: [
      {
        name: 'months',
        description: 'Number of months to project (default: 1)',
        required: false,
      },
    ],
  },
  {
    name: 'revised_estimate_analysis',
    description: 'Show history of revised estimates per job and calculate average overage across all projects',
    arguments: [
      {
        name: 'projectId',
        description: 'Project ID (GUID) for specific analysis (optional - if not provided, analyzes all)',
        required: false,
      },
    ],
  },
  {
    name: 'job_benchmarking',
    description: 'Calculate average cost and duration of specific job types (e.g., flooring, framing, insulation) from historical completed projects',
    arguments: [
      {
        name: 'jobType',
        description: 'Type of work to benchmark (e.g., flooring, framing, plumbing)',
        required: false,
      },
    ],
  },
  {
    name: 'cost_per_square_foot_report',
    description: 'Break down costs by trade (e.g., drywall, lumber, paint) based on square footage for completed projects',
    arguments: [
      {
        name: 'projectId',
        description: 'Project ID (GUID) for specific analysis (optional)',
        required: false,
      },
    ],
  },
  {
    name: 'change_order_tracking',
    description: 'Track and report on all cost revisions (labeled as "revised estimates" for cost-plus jobs) with complete history',
    arguments: [
      {
        name: 'projectId',
        description: 'Project ID (GUID) to track revisions for (optional)',
        required: false,
      },
    ],
  },
  {
    name: 'upgrade_pricing',
    description: 'Price out client upgrade requests using standard pricing templates and create revised estimate',
    arguments: [
      {
        name: 'projectId',
        description: 'Project ID (GUID) for the upgrade',
        required: true,
      },
      {
        name: 'upgradeItems',
        description: 'Description of items to upgrade (e.g., "premium fixtures in master bath")',
        required: true,
      },
    ],
  },
  {
    name: 'update_schedule',
    description: 'Extend or adjust project schedule by a specified number of days due to delays (painting, plumbing, weather, material delivery, etc.)',
    arguments: [
      {
        name: 'projectName',
        description: 'Name or ID of the project to update',
        required: true,
      },
      {
        name: 'numberOfDays',
        description: 'Number of days to extend the schedule',
        required: true,
      },
      {
        name: 'reason',
        description: 'Reason for delay (e.g., "plumbing delay", "weather", "material delivery")',
        required: true,
      },
      {
        name: 'taskName',
        description: 'Specific task affected (optional - if not provided, extends entire schedule)',
        required: false,
      },
    ],
  },
  {
    name: 'missed_action_items_alert',
    description: 'Alert for unprocessed action items older than 24 hours that need attention',
    arguments: [
      {
        name: 'hoursThreshold',
        description: 'Hour threshold for considering items overdue (default: 24)',
        required: false,
      },
    ],
  },
  {
    name: 'blind_spots_report',
    description: 'Analyze all action items, cost changes, and schedule changes to identify critical issues or patterns that may need owner attention',
    arguments: [],
  },
  {
    name: 'generate_job_status_report',
    description: 'Create weekly job status report using action items and comments, organized by project',
    arguments: [
      {
        name: 'projectId',
        description: 'Project ID (GUID) for specific project report (optional)',
        required: false,
      },
      {
        name: 'days',
        description: 'Number of days to include in report (default: 7)',
        required: false,
      },
    ],
  },
  {
    name: 'plan_analysis',
    description: 'Analyze building plans to count doors, windows, cabinets, and generate quantity takeoffs (Note: Claude can analyze uploaded images/PDFs directly)',
    arguments: [
      {
        name: 'planDescription',
        description: 'Description of the plan or what needs to be counted',
        required: true,
      },
    ],
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
      description: `JoeAPI Construction Management MCP Server

IMPORTANT WORKFLOW PROTOCOL:
This server provides 49 MCP tools AND 18 pre-built workflow prompts for common construction management tasks.

BEFORE using individual tools, ALWAYS:
1. Check available workflow prompts using list_prompts
2. If a relevant prompt exists, use get_prompt to retrieve it
3. Execute the workflow steps provided by the prompt
4. Only use individual tools if no prompt matches your task

WORKFLOW PROMPT CATEGORIES:
• Financial Reports: WIP reports, budget tracking, deposits, receivables, forecasts, income projections
• Project Analytics: pipeline summary, estimate revisions, benchmarking, cost per sqft, change orders
• Operational: schedule updates, overdue alerts, blind spots analysis, status reports, plan analysis

WHY USE PROMPTS:
Prompts provide step-by-step instructions that combine multiple tools in the correct sequence, include proper data analysis, and generate formatted reports automatically. They represent best practices for common workflows.

EXAMPLE:
Instead of: "let me call list_project_managements, then list_transactions, then..."
Do this: "get_prompt with name='work_in_process_report'" and follow the instructions

Available prompts: work_in_process_report, detailed_budget_tracking, deposit_tracking, cost_to_estimate_report, receivables_report, gross_receipts_forecast, projected_income, job_queue_summary, revised_estimate_analysis, job_benchmarking, cost_per_square_foot_report, change_order_tracking, upgrade_pricing, update_schedule, missed_action_items_alert, blind_spots_report, generate_job_status_report, plan_analysis`,
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts,
  }));

  // Get specific prompt with instructions
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const prompt = prompts.find(p => p.name === name);
    if (!prompt) {
      throw new Error(`Prompt not found: ${name}`);
    }

    // Build the prompt message with step-by-step instructions from joetasks.json
    let instructions = '';

    // Add task-specific instructions based on the prompt name
    switch (name) {
      case 'work_in_process_report':
        instructions = `To generate a Work-in-Process (WIP) Report, follow these steps:

STEP 1: Use list_project_managements
Context: Retrieve all active projects to determine which jobs are currently in process.
Validation: Active projects list showing current status of each job.

STEP 2: Use list_project_schedule_tasks
Context: For each active project, get the construction tasks to see which tasks are completed, in progress, and upcoming.
Validation: Task lists show completion status and provide insight into work progress.

STEP 3: Use list_action_items
Context: Get all action items for active projects, particularly cost changes and schedule changes that indicate work adjustments.
Validation: Action items show recent changes, issues, and adjustments to the work in process.

STEP 4: Use list_transactions
Context: Access QB transaction data to determine actual costs incurred on each work-in-process job, filtered by project ClassID to get spending to date.
Validation: Transaction data shows actual costs spent on each WIP project by category (labor, materials, subcontractors).

STEP 5: Use list_job_balances
Context: Get current job balance for each WIP project showing the financial position (balance owed or credit available).
Validation: Job balances provide current financial status for each work-in-process project.

STEP 6: Generate comprehensive WIP report
Context: Using Claude's analysis capabilities, generate comprehensive WIP report showing: (1) All active projects, (2) Completion percentage, (3) Costs incurred vs. budget, (4) Current balances, (5) Estimated completion date, (6) Outstanding issues/action items.
Validation: WIP report provides complete status of all ongoing work with financial and timeline metrics.`;
        break;

      case 'detailed_budget_tracking':
        instructions = `To report how far a job is over/under budget, follow these steps:

STEP 1: Use list_estimates
Context: Get the original estimate/budget for the specific job${args?.projectId ? ` (projectId: ${args.projectId})` : ''}.
Validation: Original budget retrieved with breakdown by category.

STEP 2: Use list_cost_revisions
Context: Retrieve all cost revisions for the job to get complete history of budget adjustments.
Validation: All budget adjustments retrieved with dates, amounts, and categories.

STEP 3: Use list_transactions
Context: Get QB transaction data filtered by project ClassID to retrieve actual costs spent on the job to date, broken down by account/category.
Validation: Actual costs show all expenditures by category (labor, materials, subcontractors, etc.).

STEP 4: Use get_cost_variance
Context: Calculate budget variance showing: (1) Original estimate, (2) Revised estimate with all changes, (3) Actual costs to date, (4) Variance amount and percentage over/under budget.
Validation: Report shows job is $X over budget (Y% over revised budget) with detailed variance by category.`;
        break;

      case 'deposit_tracking':
        instructions = `To track owner deposits and current balance on job accounts, follow these steps:

STEP 1: Use list_deposits
Context: Access deposit/retainer tracking to get initial owner deposits for each job/project${args?.projectId ? ` (filter by projectId: ${args.projectId})` : ''}, including deposit amounts and usage to date.
Validation: Deposit records show initial deposit amounts, amounts used, and current balances for all projects.

STEP 2: Use get_deposit_by_project
Context: ${args?.projectId ? `Get detailed deposit information for projectId: ${args.projectId}` : 'For each project, get detailed deposit information'}, showing initial deposit, all draws/payments made against it, and remaining balance.
Validation: Detailed deposit data shows complete payment history and current balance for the project.

STEP 3: Use list_transactions
Context: Retrieve QB transactions filtered by deposit/retainer accounts to see detailed payment history and draws made against deposits.
Validation: Transaction history shows all amounts withdrawn from deposit accounts with dates and descriptions.

STEP 4: Use list_project_managements
Context: Get project information to associate deposits with specific jobs and clients for comprehensive reporting.
Validation: Project data provides context linking deposits to job details and client information.

STEP 5: Generate deposit report
Context: Using Claude's analysis capabilities, generate formatted report showing: initial deposit, payments to date, current balance, and percentage of deposit used for each job.
Validation: Report clearly shows deposit status for each job account with usage percentages.`;
        break;

      case 'cost_to_estimate_report':
        instructions = `To provide real-time cost vs. estimate tracking report, follow these steps:

STEP 1: Use list_estimates
Context: Retrieve all estimates to get the original budgeted costs for each project.
Validation: Estimates show original budget breakdown by category/trade.

STEP 2: Use list_cost_revisions
Context: Get all cost revisions for each project showing the complete history of budget changes and estimate adjustments.
Validation: Cost revision history shows all budget modifications with dates, amounts, and reasons.

STEP 3: Use list_transactions
Context: Retrieve QB transaction data filtered by project to get actual costs incurred to date, broken down by account/category (labor, materials, subcontractors).
Validation: Transaction data shows actual costs spent on each project by category.

STEP 4: Use get_cost_variance
Context: Calculate cost variance analysis comparing original estimate, revised estimate (with approved changes), and actual costs to date. Shows variance in dollars and percentage over/under budget.
Validation: Variance report shows for each category: estimated, actual, variance in dollars and percentage.

STEP 5: Generate real-time cost dashboard
Context: Using Claude's analysis capabilities, generate real-time dashboard showing cost vs. estimate status for all active projects, highlighting categories that are over/under budget.
Validation: Dashboard provides immediate visibility into cost performance across all projects with indicators for budget status.`;
        break;

      case 'receivables_report':
        instructions = `To generate balances on supervision collected and supervision receivables, follow these steps:

STEP 1: Use list_invoices
Context: Get all invoices from the system to identify outstanding supervision fee invoices and paid invoices for receivables analysis.
Validation: Invoice data shows amounts, dates, payment status, and aging information for all supervision fees.

STEP 2: Use list_transactions
Context: Retrieve QB transactions filtered by supervision-related accounts to get payment collection history and calculate total collected to date.
Validation: Transaction records show all supervision fee payments that have been successfully collected.

STEP 3: Use list_clients
Context: Get client information to associate receivables with specific clients and their supervision fee arrangements.
Validation: Client data helps identify who owes supervision fees and their payment history.

STEP 4: Use list_job_balances
Context: Get current job balances to understand the financial position of each project, including amounts owed or credit available.
Validation: Job balances provide per-project financial status relevant to receivables analysis.

STEP 5: Generate receivables report
Context: Using Claude's analysis capabilities, generate formatted receivables report showing supervision collected balance, supervision receivables balance, and breakdown by client with aging.
Validation: Report clearly shows total collected, total receivable, and detail by client with days outstanding.`;
        break;

      case 'gross_receipts_forecast':
        instructions = `To project gross receipts for the coming month, follow these steps:

STEP 1: Use list_project_managements
Context: Get all active projects to calculate expected payments based on project completion and payment schedules.
Validation: Projects returned with completion status and payment milestone information.

STEP 2: Use list_proposals
Context: Retrieve recently accepted proposals that will generate initial deposits or payments in the coming month.
Validation: Newly accepted proposals that haven't started yet, representing new deposit income.

STEP 3: Use list_invoices
Context: Get all invoices to identify payments due in the next month from all active projects, including amounts, dates, and client information.
Validation: Invoice list shows upcoming payments with due dates within the forecast period.

STEP 4: Use list_deposits
Context: Check deposit/retainer balances to include expected deposit draws and remaining retainer funds available for billing.
Validation: Deposit data shows available retainer funds and deposit usage patterns for revenue forecasting.

STEP 5: Calculate gross receipts forecast
Context: Using Claude's calculation capabilities, calculate total gross receipts forecast by summing: (1) Scheduled milestone payments from invoices, (2) New proposal deposits, (3) Expected deposit draws, (4) Historical collection rate adjustments.
Validation: Total gross receipts projection with breakdown by source and confidence intervals based on historical collection rates.`;
        break;

      case 'job_queue_summary':
        instructions = `To report on number of homes in queue, under construction, and upcoming pipeline, follow these steps:

STEP 1: Use get_proposal_pipeline
Context: Get comprehensive pipeline analytics showing all proposals categorized by stage (pending, accepted, in progress, completed) with counts, total values, and timeline information.
Validation: Pipeline data provides complete breakdown of proposals by stage with financial metrics and timing.

STEP 2: Use list_project_managements
Context: Retrieve all active projects to count homes currently under construction and verify current work status.
Validation: Project list shows active construction projects with their current status for verification.

STEP 3: Use list_project_schedules
Context: Get project schedules to determine which projects are actively being worked on versus scheduled to start soon.
Validation: Schedules show current vs. upcoming projects based on start dates.

STEP 4: Generate queue summary report
Context: Using Claude's analysis capabilities, create a formatted summary report visualizing the pipeline with counts, total values, and expected timeline for each category: (1) Queue - proposals pending acceptance, (2) Under Construction - active projects in progress, (3) Upcoming - accepted proposals not yet started.
Validation: Report shows clear metrics: number of homes in each stage, total contract values, expected start/completion dates.`;
        break;

      case 'projected_income':
        instructions = `To estimate expected monthly income, follow these steps:

STEP 1: Use list_proposals
Context: Retrieve all active proposals to calculate potential income from proposals that are likely to be accepted this month.
Validation: Proposals are returned with their total amounts and current status (pending, accepted, etc.).

STEP 2: Use list_proposal_lines
Context: For each proposal, get the detailed line items to understand the breakdown of income sources and payment schedules.
Validation: Proposal line items show detailed pricing and can be used to calculate payment milestones.

STEP 3: Use list_project_managements
Context: Get all active projects to determine ongoing income from projects in progress, including percentage complete and remaining payments.
Validation: Project data includes completion percentages and payment schedules.

STEP 4: Calculate projected income
Context: Using Claude's calculation capabilities, calculate projected monthly income based on: (1) Expected proposal acceptances with historical acceptance rate, (2) Scheduled milestone payments from active projects, (3) Completion-based payments calculated from project progress.
Validation: Income projection shows breakdown by source (new proposals, active projects) with confidence levels and expected payment dates.`;
        break;

      case 'revised_estimate_analysis':
        instructions = `To show history of revised estimates per job and calculate average overage, follow these steps:

STEP 1: Use list_estimates
Context: Get all estimates to identify the original budget for each job.
Validation: Estimates list shows original budget amounts by job/project.

STEP 2: Use get_estimate_revision_history
Context: Retrieve complete revision history for each estimate${args?.projectId ? ` (projectId: ${args.projectId})` : ''} showing all changes from original to current, with dates, amounts, and reasons for each revision.
Validation: Estimate revision history provides complete audit trail of all budget changes per job.

STEP 3: Use list_cost_revisions
Context: Get detailed cost revision data for all projects to analyze revision patterns, amounts, and categories affected.
Validation: Cost revision data shows amounts, categories, dates, and cumulative impact for each job.

STEP 4: Analyze revision history
Context: Using Claude's analysis capabilities, analyze the cost change history to: (1) Group revisions by job, (2) Calculate total revised amount per job, (3) Calculate overage (revised estimate - original estimate), (4) Calculate average overage across all jobs.
Validation: Analysis shows per-job revision history, total overage per job, and company-wide average overage percentage.

STEP 5: Generate trend analysis
Context: Using Claude's pattern recognition, generate trend report showing revision patterns: which estimate categories most frequently require revisions, average time to revision, correlation with job type/size.
Validation: Report identifies patterns in estimate revisions to help improve future estimating accuracy.`;
        break;

      case 'job_benchmarking':
        instructions = `To analyze average cost and duration of specific job types from historical jobs, follow these steps:

STEP 1: Use list_project_managements
Context: Retrieve all completed projects to build historical database for benchmarking.
Validation: Historical project data includes completion dates and project types.

STEP 2: Use list_transactions
Context: Access QB transaction history for completed projects broken down by account/category to get actual costs by trade/task type (flooring, framing, insulation, etc.)${args?.jobType ? ` focusing on ${args.jobType}` : ''}.
Validation: Transaction history shows actual costs by category across multiple completed projects.

STEP 3: Use list_schedule_revisions
Context: Retrieve schedule revision history to understand actual duration data for tasks, including delays and adjustments that affected completion times.
Validation: Schedule revision data provides insight into actual task durations and timeline variations from historical projects.

STEP 4: Calculate benchmarks
Context: Using Claude's statistical analysis capabilities, calculate benchmarks: (1) Average cost by task type, (2) Average duration by task type, (3) Cost/duration by project size, (4) Standard deviation and ranges.
Validation: Statistical analysis provides reliable averages and ranges for each job type.

STEP 5: Generate benchmark report
Context: Generate benchmark report showing average costs and durations for each task type, useful for estimating future projects.
Validation: Report shows clear benchmarks: Task X averages $Y and Z days based on N historical projects.`;
        break;

      case 'cost_per_square_foot_report':
        instructions = `To break down costs by trade based on square footage, follow these steps:

STEP 1: Use get_project_details
Context: Retrieve comprehensive project details including total square footage, project specifications, and metadata for each completed project${args?.projectId ? ` (projectId: ${args.projectId})` : ''}.
Validation: Project details include square footage data available for cost/sqft calculations.

STEP 2: Use list_transactions
Context: Get QB transaction data for each project broken down by account/category to get detailed cost breakdown by trade (drywall, lumber, paint, etc.).
Validation: Transaction data provides costs itemized by trade/material category for each project.

STEP 3: Calculate cost per square foot
Context: Using Claude's calculation capabilities, calculate cost per square foot for each trade: Trade Cost / Total Square Feet = $/sqft by trade.
Validation: Cost per sqft calculated for each trade across projects.

STEP 4: Generate comparative analysis
Context: Compare cost/sqft across ${args?.projectId ? 'specific project against averages' : 'multiple projects to identify trends, outliers, and averages'} by trade.
Validation: Analysis shows which projects had high/low costs per sqft and why.

STEP 5: Format cost/sqft report
Context: Generate report showing cost breakdown per square foot by trade, with project comparisons and averages.
Validation: Report clearly shows $/sqft for each trade with project-by-project and average data.`;
        break;

      case 'change_order_tracking':
        instructions = `To create and label 'revised estimates' instead of 'change orders' for cost-plus jobs, follow these steps:

STEP 1: Use list_cost_revisions
Context: Retrieve all cost revisions which represent changes to the original estimate, providing complete revision history per job.
Validation: Cost revisions retrieved showing all estimate changes with dates, amounts, and categories.

STEP 2: Use get_estimate_revision_history
Context: Get comprehensive estimate revision history showing progression from original to current estimate with all intermediate changes.
Validation: Revision history provides complete audit trail of estimate changes over time.

STEP 3: Use create_action_item
Context: Create general change order action items (ActionTypeId=8) but label them as 'Revised Estimates' in the title/description for cost-plus jobs.
Validation: Action items created with 'Revised Estimate' terminology appropriate for cost-plus contracts.

STEP 4: Use create_action_item_cost_change
Context: Add detailed cost change data to track revision amount, category affected, and reason for change in a structured format.
Validation: Cost change data captured showing specific amounts and categories for the revision.

STEP 5: Generate revised estimate report
Context: Using Claude's formatting capabilities, generate 'Revised Estimate' reports (avoiding 'change order' language) showing current budget including all approved revisions.
Validation: Report uses 'Revised Estimate' terminology and shows clear progression from original to current estimate.`;
        break;

      case 'upgrade_pricing':
        instructions = `To price out client upgrade requests and revise estimate accordingly, follow these steps:

Required Arguments:
- projectId: ${args?.projectId || 'PROJECT_ID'}
- upgradeItems: ${args?.upgradeItems || 'ITEM_DESCRIPTION (e.g., "granite countertops upgrade from laminate")'}

STEP 1: Use get_proposal_template_pricing
Context: Access standard pricing templates to get baseline costs for common upgrade categories (fixtures, materials, features) with predefined rates and line items.
Validation: Template pricing data retrieved showing standard rates for common upgrade categories.

STEP 2: Calculate upgrade cost
Context: Using Claude's calculation capabilities, calculate upgrade cost differential: (Upgrade Item Cost - Standard Item Cost) + Additional Labor + Installation Differences = Net Upgrade Cost. Use the standard and upgrade options specified in the prompt.
Validation: Upgrade pricing calculated showing incremental cost vs. standard option for the items specified in the request.

STEP 3: Use create_action_item (Cost Change)
Context: Create cost change action item (ActionTypeId=1) documenting the upgrade request, the items being upgraded (from prompt), and the cost impact on the estimate.
Validation: Cost change action item created with upgrade details (item names, quantities) and pricing from the calculation.

STEP 4: Use create_action_item_cost_change
Context: Add cost change data to the action item specifying the upgrade amount calculated and the affected estimate category (fixtures, materials, labor, etc.).
Validation: Cost change data added showing upgrade amount and the specific estimate category being affected.

STEP 5: Use list_clients
Context: Get client information for the client/project specified in the prompt to send the revised estimate with upgrade pricing.
Validation: Client contact info retrieved for delivering the revised estimate with upgrade pricing.

STEP 6: Generate revised estimate
Context: Using Claude's report generation capabilities, generate revised estimate incorporating the approved upgrade pricing, showing the original estimate, upgrade costs, and new total. Include itemized breakdown of upgrades.
Validation: Updated estimate shows new total with upgrade(s) itemized, making it clear what changed from the original estimate.`;
        break;

      case 'update_schedule':
        instructions = `To extend or adjust project schedule by specified number of days due to delays, follow these steps:

Required Arguments:
- projectName: ${args?.projectName || 'PROJECT_NAME'}
- numberOfDays: ${args?.numberOfDays || 'NUMBER_OF_DAYS'}
- reason: ${args?.reason || 'REASON (e.g., painting, plumbing, weather, material delivery)'}

STEP 1: Use list_project_schedules
Context: First, retrieve all project schedules to identify which project schedule needs to be updated based on the user's prompt (project name or identifier). This gives us the schedule IDs available in the system.
Validation: Check that the response contains a list of project schedules with their IDs. Look for the specific project mentioned in the user's request.

STEP 2: Use list_project_schedule_tasks
Context: Now that we have the schedule ID, get all the tasks within that schedule. Look for tasks related to the specific trade or reason mentioned in the prompt (e.g., painting, plumbing, electrical, etc.) that need to be delayed.
Validation: Verify the response contains construction tasks with their current dates. Identify the specific tasks related to the trade/reason mentioned in the user's request.

STEP 3: Use create_action_item (Schedule Change)
Context: Create a schedule change action item to document the schedule adjustment. Use ActionTypeId=2 (Schedule Change) with ScheduleChange object specifying NoOfDays=[from prompt] and the ConstructionTaskId from step 2. Include the reason for delay in the description.
Validation: Confirm the action item was created successfully with ActionTypeId=2, and the ScheduleChange object shows the correct number of days specified in the prompt. Check that the action item includes the correct task ID and reason.

NOTE: The API endpoint PUT /api/v1/projectscheduletasks/:id exists for actually updating task dates, but it's not yet exposed as an MCP tool. For now, document the change with action items. Actual task date updates coming soon!`;
        break;

      case 'missed_action_items_alert':
        instructions = `To alert for unprocessed action items older than 24 hours, follow these steps:

STEP 1: Use list_action_items
Context: Retrieve all action items to analyze their creation dates and current status.
Validation: All action items returned with DateCreated and Status fields.

STEP 2: Filter by date and status
Context: Using Claude's date filtering capabilities, filter action items to find those created more than ${args?.hoursThreshold || '24'} hours ago that still have Status=1 (Open) or Status=2 (In Progress) without recent updates.
Validation: Filtered list shows only unprocessed action items older than ${args?.hoursThreshold || '24'} hours.

STEP 3: Use get_action_item
Context: For each old unprocessed item, get full details including comments to understand if there's been any activity.
Validation: Full action item data shows whether item is truly stagnant or has recent activity in comments.

STEP 4: Generate alert notification
Context: Using Claude's analysis capabilities, send alert notifications (formatted report) about unprocessed action items to responsible supervisors/managers.
Validation: Alerts formatted listing overdue action items with appropriate detail.

STEP 5: Format missed items report
Context: Generate daily report of all missed/overdue action items for management review.
Validation: Report shows actionable list of items requiring attention with age and assigned personnel.`;
        break;

      case 'blind_spots_report':
        instructions = `To summarize critical company updates or issues the owner might not be aware of, follow these steps:

STEP 1: Use list_action_items
Context: Analyze all recent action items to identify critical issues, cost changes, and schedule delays.
Validation: Action items show potential problem areas and critical updates.

STEP 2: Use get_action_item_cost_change
Context: Review all cost changes to identify budget overruns that may not have been escalated to owner.
Validation: Cost changes reveal budget issues that need owner attention.

STEP 3: Use get_action_item_schedule_change
Context: Review schedule changes to identify cumulative delays across projects.
Validation: Schedule changes show project timeline issues needing escalation.

STEP 4: Analyze blind spot patterns
Context: Using Claude's pattern recognition capabilities, identify patterns and issues that may indicate blind spots: (1) Recurring problems not being addressed, (2) Cumulative small issues becoming big problems, (3) Communication gaps, (4) Unreported delays/overruns.
Validation: Analysis identifies potential blind spots and areas requiring owner awareness.

STEP 5: Generate executive summary
Context: Generate executive summary report highlighting critical issues, trends, and recommendations that owner should be aware of.
Validation: Concise report provides owner with visibility into potential blind spots and action needed.`;
        break;

      case 'generate_job_status_report':
        instructions = `To sort conversations by job and create weekly status reports, follow these steps:

STEP 1: Use list_action_items
Context: Get all action items ${args?.projectId ? `for projectId: ${args.projectId}` : 'for each project'} from the past ${args?.days || '7'} days to supplement the conversation data with actual work items and their status.
Validation: Action items are returned grouped by project, showing what work was discussed and completed.

STEP 2: Use list_action_item_comments
Context: For key action items, retrieve the comment threads to understand the conversation flow and decisions made.
Validation: Comments provide context and timeline of discussions for each action item.

STEP 3: Analyze and group by project
Context: Using Claude's grouping and analysis capabilities, group action items and their comments by project/job to understand the weekly activity for each job.
Validation: Data is organized by project showing weekly work progression.

STEP 4: Generate job status report
Context: Using Claude's report formatting capabilities, apply a structured status report format showing for each job: (1) What work was discussed, (2) What was completed, (3) What's pending, (4) Key decisions made.
Validation: Each job has a formatted status report following the structure with all relevant information included.`;
        break;

      case 'plan_analysis':
        instructions = `To analyze building plans and generate quantity takeoffs (count doors, windows, cabinets, calculate sqft), follow these steps:

IMPORTANT: As Claude, I have native vision capabilities and can directly analyze uploaded images and PDFs!

Plan Description: ${args?.planDescription || 'PLAN_DESCRIPTION'}

STEP 1: Request plan upload
Context: Ask the user to upload the building plan files (PDF, images like PNG/JPG, or CAD exports). Explain that Claude can analyze these directly using built-in vision capabilities.
Validation: User provides plan image or PDF file.

STEP 2: Analyze plans with vision
Context: Using Claude's native vision capabilities, analyze the uploaded plan to identify architectural elements: doors, windows, cabinets, rooms, dimensions. Look for symbols, labels, and scale indicators.
Validation: AI successfully identifies and counts major plan elements from the visual analysis.

STEP 3: Generate quantity takeoffs
Context: Count and categorize elements found in the plans: (1) Doors by type/size, (2) Windows by type/size, (3) Linear feet of cabinets, (4) Square footage by room, (5) Other fixtures and finishes.
Validation: Detailed quantity takeoff showing counts and measurements of all elements.

STEP 4: Convert to material estimates
Context: Using Claude's calculation capabilities and standard construction formulas, convert quantity takeoffs into material estimates (e.g., sqft of drywall, linear feet of trim, etc.).
Validation: Material quantities calculated based on plan measurements.

STEP 5: Format takeoff report
Context: Generate comprehensive takeoff report showing all quantities, measurements, and preliminary material estimates organized by category.
Validation: Report provides complete quantity takeoff ready for pricing/estimating.`;
        break;

      default:
        instructions = `This workflow prompt (${name}) is available but specific step-by-step instructions are not yet defined. Please use the available tools creatively to accomplish this task.`;
    }

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: instructions,
          },
        },
      ],
    };
  });

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
