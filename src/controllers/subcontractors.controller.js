/**
 * SubContractors Controller
 * Note: NO UserId (not multi-tenant), has IsActive (soft delete)
 */

const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const response = require('../utils/response');
const { getAuditValues, getSoftDeleteValues } = require('../middleware/audit');

const getAllSubContractors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', category = '', includeInactive = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = includeInactive ? '' : 'WHERE [IsActive] = 1';
    const params = { offset, limit };

    if (search) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ');
      whereClause += `([Name] LIKE '%' + @search + '%' OR [Email] LIKE '%' + @search + '%' OR [Company] LIKE '%' + @search + '%')`;
      params.search = search;
    }

    if (category) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ');
      whereClause += `[Category] = @category`;
      params.category = category;
    }

    const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM dbo.[SubContractors] ${whereClause}`, params);
    const total = countResult.recordset[0].total;

    const dataResult = await executeQuery(`
      SELECT * FROM dbo.[SubContractors]
      ${whereClause}
      ORDER BY [Name] ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `, params);

    return response.paginated(res, dataResult.recordset, page, limit, total, 'SubContractors retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getSubContractorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await executeQuery(`
      SELECT * FROM dbo.[SubContractors]
      WHERE [Id] = @id AND [IsActive] = 1
    `, { id });

    if (result.recordset.length === 0) {
      return response.error(res, 'SubContractor not found', 404);
    }
    return response.success(res, result.recordset[0], 'SubContractor retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createSubContractor = async (req, res, next) => {
  try {
    const id = uuidv4();
    const audit = getAuditValues(req.user, 'create');

    const fields = Object.keys(req.body);
    const values = fields.map(f => `@${f}`).join(', ');
    const params = { id, ...req.body, IsActive: true, CreatedBy: audit.CreatedBy, DateCreated: audit.DateCreated };

    const result = await executeQuery(`
      INSERT INTO dbo.[SubContractors]
      ([Id], ${fields.map(f => `[${f}]`).join(', ')}, [IsActive], [CreatedBy], [DateCreated])
      VALUES (@id, ${values}, @IsActive, @CreatedBy, @DateCreated);

      SELECT * FROM dbo.[SubContractors] WHERE [Id] = @id
    `, params);

    return response.success(res, result.recordset[0], 'SubContractor created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateSubContractor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[SubContractors] WHERE [Id] = @id AND [IsActive] = 1`, { id });
    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'SubContractor not found', 404);
    }

    const audit = getAuditValues(req.user, 'update');
    const updates = Object.keys(req.body).map(k => `[${k}] = @${k}`);
    updates.push('[UpdatedBy] = @UpdatedBy', '[DateUpdated] = @DateUpdated');

    const params = { id, ...req.body, UpdatedBy: audit.UpdatedBy, DateUpdated: audit.DateUpdated };

    const result = await executeQuery(`
      UPDATE dbo.[SubContractors]
      SET ${updates.join(', ')}
      WHERE [Id] = @id;

      SELECT * FROM dbo.[SubContractors] WHERE [Id] = @id
    `, params);

    return response.success(res, result.recordset[0], 'SubContractor updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteSubContractor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[SubContractors] WHERE [Id] = @id AND [IsActive] = 1`, { id });
    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'SubContractor not found', 404);
    }

    const softDelete = getSoftDeleteValues(req.user, 'IsActive');
    await executeQuery(`
      UPDATE dbo.[SubContractors]
      SET [IsActive] = @IsActive, [UpdatedBy] = @UpdatedBy, [DateUpdated] = @DateUpdated
      WHERE [Id] = @id
    `, { id, ...softDelete });

    return response.success(res, null, 'SubContractor deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubContractors,
  getSubContractorById,
  createSubContractor,
  updateSubContractor,
  deleteSubContractor
};
