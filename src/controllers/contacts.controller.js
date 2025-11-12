/**
 * Contacts Controller
 *
 * Handles CRUD operations for Contacts table
 * Note: Contacts table has NO UserId (not multi-tenant)
 */

const { v4: uuidv4 } = require('uuid');
const sql = require('mssql');
const { executeQuery } = require('../config/database');
const response = require('../utils/response');
const { getAuditValues, getSoftDeleteValues } = require('../middleware/audit');

/**
 * Get all contacts (with pagination)
 * GET /api/v1/contacts
 */
const getAllContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', includeInactive = false } = req.query;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = '';
    const params = {};

    if (!includeInactive) {
      whereClause = 'WHERE [IsActive] = 1';
    }

    if (search) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ');
      whereClause += `([Name] LIKE '%' + @search + '%' OR [Email] LIKE '%' + @search + '%')`;
      params.search = search;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM dbo.[Contacts]
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult.recordset[0].total;

    // Get paginated results
    const dataQuery = `
      SELECT
        [Id],
        [Name],
        [Email],
        [Phone],
        [Address],
        [City],
        [State],
        [IsActive],
        [CreatedBy],
        [DateCreated],
        [UpdatedBy],
        [DateUpdated]
      FROM dbo.[Contacts]
      ${whereClause}
      ORDER BY [Name] ASC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;
    const dataResult = await executeQuery(dataQuery, { ...params, offset, limit });

    return response.paginated(
      res,
      dataResult.recordset,
      page,
      limit,
      total,
      'Contacts retrieved successfully'
    );

  } catch (error) {
    next(error);
  }
};

/**
 * Get contact by ID
 * GET /api/v1/contacts/:id
 */
const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        [Id],
        [Name],
        [Email],
        [Phone],
        [Address],
        [City],
        [State],
        [IsActive],
        [CreatedBy],
        [DateCreated],
        [UpdatedBy],
        [DateUpdated]
      FROM dbo.[Contacts]
      WHERE [Id] = @id AND [IsActive] = 1
    `;

    const result = await executeQuery(query, { id });

    if (result.recordset.length === 0) {
      return response.error(res, 'Contact not found', 404);
    }

    return response.success(res, result.recordset[0], 'Contact retrieved successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Create new contact
 * POST /api/v1/contacts
 */
const createContact = async (req, res, next) => {
  try {
    const { Name, Email, Phone, Address, City, State } = req.body;
    const id = uuidv4();

    // Get audit values
    const audit = getAuditValues(req.user, 'create');

    const query = `
      INSERT INTO dbo.[Contacts] (
        [Id],
        [Name],
        [Email],
        [Phone],
        [Address],
        [City],
        [State],
        [IsActive],
        [CreatedBy],
        [DateCreated]
      )
      VALUES (
        @id,
        @Name,
        @Email,
        @Phone,
        @Address,
        @City,
        @State,
        @IsActive,
        @CreatedBy,
        @DateCreated
      );

      SELECT
        [Id],
        [Name],
        [Email],
        [Phone],
        [Address],
        [City],
        [State],
        [IsActive],
        [CreatedBy],
        [DateCreated]
      FROM dbo.[Contacts]
      WHERE [Id] = @id
    `;

    const result = await executeQuery(query, {
      id,
      Name,
      Email: Email || null,
      Phone: Phone || null,
      Address: Address || null,
      City: City || null,
      State: State || null,
      IsActive: true,
      CreatedBy: audit.CreatedBy,
      DateCreated: audit.DateCreated
    });

    return response.success(
      res,
      result.recordset[0],
      'Contact created successfully',
      201
    );

  } catch (error) {
    next(error);
  }
};

/**
 * Update contact
 * PUT /api/v1/contacts/:id
 */
const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Name, Email, Phone, Address, City, State } = req.body;

    // Check if contact exists
    const checkQuery = `
      SELECT COUNT(*) AS cnt
      FROM dbo.[Contacts]
      WHERE [Id] = @id AND [IsActive] = 1
    `;
    const checkResult = await executeQuery(checkQuery, { id });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'Contact not found', 404);
    }

    // Get audit values
    const audit = getAuditValues(req.user, 'update');

    // Build dynamic UPDATE query based on provided fields
    const updates = [];
    const params = { id, UpdatedBy: audit.UpdatedBy, DateUpdated: audit.DateUpdated };

    if (Name !== undefined) {
      updates.push('[Name] = @Name');
      params.Name = Name;
    }
    if (Email !== undefined) {
      updates.push('[Email] = @Email');
      params.Email = Email || null;
    }
    if (Phone !== undefined) {
      updates.push('[Phone] = @Phone');
      params.Phone = Phone || null;
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

    updates.push('[UpdatedBy] = @UpdatedBy');
    updates.push('[DateUpdated] = @DateUpdated');

    const query = `
      UPDATE dbo.[Contacts]
      SET ${updates.join(', ')}
      WHERE [Id] = @id;

      SELECT
        [Id],
        [Name],
        [Email],
        [Phone],
        [Address],
        [City],
        [State],
        [IsActive],
        [CreatedBy],
        [DateCreated],
        [UpdatedBy],
        [DateUpdated]
      FROM dbo.[Contacts]
      WHERE [Id] = @id
    `;

    const result = await executeQuery(query, params);

    return response.success(
      res,
      result.recordset[0],
      'Contact updated successfully'
    );

  } catch (error) {
    next(error);
  }
};

/**
 * Delete contact (soft delete)
 * DELETE /api/v1/contacts/:id
 */
const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if contact exists
    const checkQuery = `
      SELECT COUNT(*) AS cnt
      FROM dbo.[Contacts]
      WHERE [Id] = @id AND [IsActive] = 1
    `;
    const checkResult = await executeQuery(checkQuery, { id });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'Contact not found', 404);
    }

    // Get soft delete values
    const softDelete = getSoftDeleteValues(req.user, 'IsActive');

    const query = `
      UPDATE dbo.[Contacts]
      SET
        [IsActive] = @IsActive,
        [UpdatedBy] = @UpdatedBy,
        [DateUpdated] = @DateUpdated
      WHERE [Id] = @id
    `;

    await executeQuery(query, {
      id,
      IsActive: softDelete.IsActive,
      UpdatedBy: softDelete.UpdatedBy,
      DateUpdated: softDelete.DateUpdated
    });

    return response.success(res, null, 'Contact deleted successfully');

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};
