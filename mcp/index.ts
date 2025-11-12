/**
 * JoeAPI MCP Server for Smithery
 *
 * Exposes JoeAPI construction management system as MCP tools via Smithery.
 * Allows Claude and other AI assistants to interact with:
 * - Clients, Contacts, SubContractors
 * - Proposals, ProposalLines, Estimates
 * - ProjectManagements, ProjectSchedules, ProjectScheduleTasks
 * - ActionItems
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

  return response.json();
}

// Define all MCP tools for JoeAPI
const tools: Tool[] = [
  // ===== CLIENTS =====
  {
    name: 'list_clients',
    description: 'Get paginated list of clients (multi-tenant, filtered by user)',
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
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        search: { type: 'string' },
        includeInactive: { type: 'boolean' },
      },
    },
  },
  {
    name: 'create_contact',
    description: 'Create a new contact',
    inputSchema: {
      type: 'object',
      properties: {
        Name: { type: 'string' },
        Email: { type: 'string' },
        Phone: { type: 'string' },
        Address: { type: 'string' },
        City: { type: 'string' },
        State: { type: 'string' },
      },
      required: ['Name'],
    },
  },

  // ===== SUBCONTRACTORS =====
  {
    name: 'list_subcontractors',
    description: 'Get paginated list of subcontractors',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        search: { type: 'string' },
        category: { type: 'string', description: 'Filter by category (e.g., Plumbing, Electrical)' },
        includeInactive: { type: 'boolean' },
      },
    },
  },

  // ===== PROPOSALS =====
  {
    name: 'list_proposals',
    description: 'Get paginated list of proposals',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        clientId: { type: 'string', description: 'Filter by client ID' },
        includeDeleted: { type: 'boolean' },
        includeArchived: { type: 'boolean' },
      },
    },
  },
  {
    name: 'get_proposal',
    description: 'Get a specific proposal by ID',
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
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        proposalId: { type: 'string', description: 'Filter by proposal ID' },
      },
    },
  },

  // ===== ESTIMATES =====
  {
    name: 'list_estimates',
    description: 'Get paginated list of estimates',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  },

  // ===== ACTION ITEMS =====
  {
    name: 'list_action_items',
    description: 'Get paginated list of action items',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        projectId: { type: 'string', description: 'Filter by project ID' },
        includeDeleted: { type: 'boolean' },
        includeArchived: { type: 'boolean' },
      },
    },
  },
  {
    name: 'get_action_item',
    description: 'Get a specific action item by ID',
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
    description: 'Create a new action item',
    inputSchema: {
      type: 'object',
      properties: {
        Title: { type: 'string', description: 'Action item title' },
        Description: { type: 'string', description: 'Detailed description' },
        ProjectId: { type: 'string', description: 'Related project ID (optional)' },
        ActionTypeId: { type: 'number', description: 'Action type ID' },
        DueDate: { type: 'string', description: 'Due date (ISO 8601 format)' },
        Status: { type: 'number', description: 'Status code' },
        Source: { type: 'number', description: 'Source code' },
      },
      required: ['Title', 'Description', 'ActionTypeId', 'DueDate', 'Status', 'Source'],
    },
  },

  // ===== PROJECT SCHEDULES =====
  {
    name: 'list_project_schedules',
    description: 'Get paginated list of project schedules',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  },

  // ===== PROJECT SCHEDULE TASKS =====
  {
    name: 'list_project_schedule_tasks',
    description: 'Get project schedule tasks',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        scheduleId: { type: 'string', description: 'Filter by schedule ID' },
      },
    },
  },

  // ===== PROJECT MANAGEMENTS =====
  {
    name: 'list_project_managements',
    description: 'Get paginated list of project managements',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
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
      version: '1.0.2',
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
          // Debug: Log the request
          console.error('[DEBUG] Creating action item:', JSON.stringify(args));
          const createResult: any = await callJoeAPI(baseUrl, '/api/v1/actionitems', {
            method: 'POST',
            body: JSON.stringify(args),
          });
          console.error('[DEBUG] Create response:', JSON.stringify(createResult));

          // Validate we got a create response, not a list response
          if (createResult.data && Array.isArray(createResult.data)) {
            console.error('[ERROR] Got list response instead of create response!');
            throw new Error('API returned list instead of created item. This is likely a server-side issue.');
          }

          result = createResult;
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
