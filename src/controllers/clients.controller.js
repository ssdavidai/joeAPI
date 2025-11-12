/**
 * Clients Controller
 *
 * Handles CRUD operations for Clients table
 * Note: Clients table HAS UserId (multi-tenant) but NO soft delete
 */

const { v4: uuidv4 } = require('uuid');
const sql = require('mssql');
const { executeQuery } = require('../config/database');
const response = require('../utils/response');
const { getAuditValues } = require('../middleware/audit');

/**
 * Get all clients (with pagination, filtered by UserId)
 * GET /api/v1/clients
 */
const getAllClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const userId = req.userId;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE [UserId] = @userId';
    const params = { userId, offset, limit };

    if (search) {
      whereClause += ` AND ([Name] LIKE '%' + @search + '%' OR [EmailAddress] LIKE '%' + @search + '%' OR [CompanyName] LIKE '%' + @search + '%')`;
      params.search = search;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM dbo.[Clients]
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, { userId, search: params.search });
    const total = countResult.recordset[0].total;

    // Get paginated results
    const dataQuery = `
      SELECT
        [Id],
        [UserId],
        [Name],
        [Address],
        [City],
        [State],
        [CompanyName],
        [EmailAddress],
        [SecondaryEmailAddress],
        [Phone],
        [DateCreated],
        [CreatedBy],
        [DateUpdated],
        [UpdatedBy]
      FROM dbo.[Clients]
      ${whereClause}
      ORDER BY [Name] ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;
    const dataResult = await executeQuery(dataQuery, params);

    return response.paginated(
      res,
      dataResult.recordset,
      page,
      limit,
      total,
      'Clients retrieved successfully'
    );

  } catch (error) {
    next(error);
  }
};

/**
 * Get client by ID (filtered by UserId)
 * GET /api/v1/clients/:id
 */
const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const query = `
      SELECT
        [Id],
        [UserId],
        [Name],
        [Address],
        [City],
        [State],
        [CompanyName],
        [EmailAddress],
        [SecondaryEmailAddress],
        [Phone],
        [DateCreated],
        [CreatedBy],
        [DateUpdated],
        [UpdatedBy]
      FROM dbo.[Clients]
      WHERE [Id] = @id AND [UserId] = @userId
    `;

    const result = await executeQuery(query, { id, userId });

    if (result.recordset.length === 0) {
      return response.error(res, 'Client not found', 404);
    }

    return response.success(res, result.recordset[0], 'Client retrieved successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Create new client
 * POST /api/v1/clients
 */
const createClient = async (req, res, next) => {
  try {
    const {
      Name,
      Address,
      City,
      State,
      CompanyName,
      EmailAddress,
      SecondaryEmailAddress,
      Phone
    } = req.body;
    const id = uuidv4();
    const userId = req.userId;

    // Get audit values
    const audit = getAuditValues(req.user, 'create');

    const query = `
      INSERT INTO dbo.[Clients] (
        [Id],
        [UserId],
        [Name],
        [Address],
        [City],
        [State],
        [CompanyName],
        [EmailAddress],
        [SecondaryEmailAddress],
        [Phone],
        [DateCreated],
        [CreatedBy]
      )
      VALUES (
        @id,
        @userId,
        @Name,
        @Address,
        @City,
        @State,
        @CompanyName,
        @EmailAddress,
        @SecondaryEmailAddress,
        @Phone,
        @DateCreated,
        @CreatedBy
      );

      SELECT
        [Id],
        [UserId],
        [Name],
        [Address],
        [City],
        [State],
        [CompanyName],
        [EmailAddress],
        [SecondaryEmailAddress],
        [Phone],
        [DateCreated],
        [CreatedBy]
      FROM dbo.[Clients]
      WHERE [Id] = @id
    `;

    const result = await executeQuery(query, {
      id,
      userId,
      Name,
      Address: Address || null,
      City: City || null,
      State: State || null,
      CompanyName: CompanyName || null,
      EmailAddress,
      SecondaryEmailAddress: SecondaryEmailAddress || null,
      Phone: Phone || null,
      DateCreated: audit.DateCreated,
      CreatedBy: audit.CreatedBy
    });

    return response.success(
      res,
      result.recordset[0],
      'Client created successfully',
      201
    );

  } catch (error) {
    next(error);
  }
};

/**
 * Update client (filtered by UserId)
 * PUT /api/v1/clients/:id
 */
const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const {
      Name,
      Address,
      City,
      State,
      CompanyName,
      EmailAddress,
      SecondaryEmailAddress,
      Phone
    } = req.body;

    // Check if client exists and belongs to user
    const checkQuery = `
      SELECT COUNT(*) AS cnt
      FROM dbo.[Clients]
      WHERE [Id] = @id AND [UserId] = @userId
    `;
    const checkResult = await executeQuery(checkQuery, { id, userId });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'Client not found', 404);
    }

    // Get audit values
    const audit = getAuditValues(req.user, 'update');

    // Build dynamic UPDATE query based on provided fields
    const updates = [];
    const params = { id, userId, UpdatedBy: audit.UpdatedBy, DateUpdated: audit.DateUpdated };

    if (Name !== undefined) {
      updates.push('[Name] = @Name');
      params.Name = Name;
    }
    if (Address !== undefined) {
      updates.push('[Address] = @Address');
      params.Address = Address || null;
    }
    if (City !== undefined) {
      updates.push('[City] = @City');
      params.City = City || null;
    }
    if (State !== undefined) {
      updates.push('[State] = @State');
      params.State = State || null;
    }
    if (CompanyName !== undefined) {
      updates.push('[CompanyName] = @CompanyName');
      params.CompanyName = CompanyName || null;
    }
    if (EmailAddress !== undefined) {
      updates.push('[EmailAddress] = @EmailAddress');
      params.EmailAddress = EmailAddress;
    }
    if (SecondaryEmailAddress !== undefined) {
      updates.push('[SecondaryEmailAddress] = @SecondaryEmailAddress');
      params.SecondaryEmailAddress = SecondaryEmailAddress || null;
    }
    if (Phone !== undefined) {
      updates.push('[Phone] = @Phone');
      params.Phone = Phone || null;
    }

    updates.push('[UpdatedBy] = @UpdatedBy');
    updates.push('[DateUpdated] = @DateUpdated');

    const query = `
      UPDATE dbo.[Clients]
      SET ${updates.join(', ')}
      WHERE [Id] = @id AND [UserId] = @userId;

      SELECT
        [Id],
        [UserId],
        [Name],
        [Address],
        [City],
        [State],
        [CompanyName],
        [EmailAddress],
        [SecondaryEmailAddress],
        [Phone],
        [DateCreated],
        [CreatedBy],
        [DateUpdated],
        [UpdatedBy]
      FROM dbo.[Clients]
      WHERE [Id] = @id
    `;

    const result = await executeQuery(query, params);

    return response.success(
      res,
      result.recordset[0],
      'Client updated successfully'
    );

  } catch (error) {
    next(error);
  }
};

/**
 * Delete client (HARD delete - no soft delete field)
 * DELETE /api/v1/clients/:id
 */
const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if client exists and belongs to user
    const checkQuery = `
      SELECT COUNT(*) AS cnt
      FROM dbo.[Clients]
      WHERE [Id] = @id AND [UserId] = @userId
    `;
    const checkResult = await executeQuery(checkQuery, { id, userId });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'Client not found', 404);
    }

    // HARD DELETE - Clients table has no soft delete field
    const query = `
      DELETE FROM dbo.[Clients]
      WHERE [Id] = @id AND [UserId] = @userId
    `;

    await executeQuery(query, { id, userId });

    return response.success(res, null, 'Client deleted successfully');

  } catch (error) {
    // Handle foreign key constraint violations
    if (error.number === 547) {
      return response.error(
        res,
        'Cannot delete client - it is referenced by other records (proposals, etc.)',
        400
      );
    }
    next(error);
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
