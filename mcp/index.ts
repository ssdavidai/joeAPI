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

type Config = z.infer<typeof configSchema>;

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
];

// Default export: function that creates the MCP server
export default function createServer({ config }: { config: Config }) {
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
