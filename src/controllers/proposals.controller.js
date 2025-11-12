const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const response = require('../utils/response');
const { getAuditValues, getSoftDeleteValues } = require('../middleware/audit');
const { validateForeignKeyOwnership } = require('../middleware/multiTenancy');

const getAllProposals = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, clientId = '', includeDeleted = false, includeArchived = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = includeDeleted ? '' : 'WHERE [IsDeleted] = 0';
    if (!includeArchived) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ') + '[IsArchived] = 0';
    }
    const params = { offset, limit };

    if (clientId) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ') + '[ClientId] = @clientId';
      params.clientId = clientId;
    }

    const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM dbo.[Proposals] ${whereClause}`, params);
    const dataResult = await executeQuery(`
      SELECT * FROM dbo.[Proposals] ${whereClause}
      ORDER BY [Date] DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `, params);

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

const getProposalById = async (req, res, next) => {
  try {
    const result = await executeQuery(`
      SELECT * FROM dbo.[Proposals] WHERE [ID] = @id AND [IsDeleted] = 0
    `, { id: req.params.id });

    if (result.recordset.length === 0) return response.error(res, 'Proposal not found', 404);
    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const createProposal = async (req, res, next) => {
  try {
    const { ClientId } = req.body;

    // Validate ClientId FK belongs to user (if provided)
    if (ClientId) {
      const isValid = await validateForeignKeyOwnership('Clients', 'Id', ClientId, req.userId);
      if (!isValid) {
        return response.error(res, 'Invalid ClientId - client not found or does not belong to you', 400);
      }
    }

    const id = uuidv4();
    const audit = getAuditValues(req.user, 'create');

    const result = await executeQuery(`
      INSERT INTO dbo.[Proposals] (
        [ID], [Number], [ClientId], [TemplateId], [QBClassId], [QBCustomerId], [ProposalProjectId],
        [Date], [TotalAmount], [DocStatus], [IsDeleted], [IsArchived], [IncludeLinesWithZeroAmount],
        [DateCreated], [CreatedBy]
      )
      VALUES (
        @id, @Number, @ClientId, @TemplateId, @QBClassId, @QBCustomerId, @ProposalProjectId,
        @Date, @TotalAmount, @DocStatus, 0, @IsArchived, @IncludeLinesWithZeroAmount,
        @DateCreated, @CreatedBy
      );
      SELECT * FROM dbo.[Proposals] WHERE [ID] = @id
    `, {
      id,
      ...req.body,
      ClientId: ClientId || null,
      TemplateId: req.body.TemplateId || null,
      QBClassId: req.body.QBClassId || null,
      QBCustomerId: req.body.QBCustomerId || null,
      ProposalProjectId: req.body.ProposalProjectId || null,
      IsArchived: req.body.IsArchived || false,
      IncludeLinesWithZeroAmount: req.body.IncludeLinesWithZeroAmount || false,
      DateCreated: audit.DateCreated,
      CreatedBy: audit.CreatedBy
    });

    return response.success(res, result.recordset[0], 'Proposal created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ClientId } = req.body;

    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[Proposals] WHERE [ID] = @id AND [IsDeleted] = 0`, { id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'Proposal not found', 404);

    // Validate ClientId FK belongs to user (if being updated)
    if (ClientId !== undefined) {
      if (ClientId) {
        const isValid = await validateForeignKeyOwnership('Clients', 'Id', ClientId, req.userId);
        if (!isValid) {
          return response.error(res, 'Invalid ClientId - client not found or does not belong to you', 400);
        }
      }
    }

    const audit = getAuditValues(req.user, 'update');
    const updates = Object.keys(req.body).map(k => `[${k}] = @${k}`);
    updates.push('[DateUpdated] = @DateUpdated', '[UpdatedBy] = @UpdatedBy');

    const result = await executeQuery(`
      UPDATE dbo.[Proposals] SET ${updates.join(', ')} WHERE [ID] = @id;
      SELECT * FROM dbo.[Proposals] WHERE [ID] = @id
    `, {
      id,
      ...req.body,
      DateUpdated: audit.DateUpdated,
      UpdatedBy: audit.UpdatedBy
    });

    return response.success(res, result.recordset[0], 'Proposal updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteProposal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[Proposals] WHERE [ID] = @id AND [IsDeleted] = 0`, { id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'Proposal not found', 404);

    const softDelete = getSoftDeleteValues(req.user, 'IsDeleted');
    await executeQuery(`
      UPDATE dbo.[Proposals]
      SET [IsDeleted] = @IsDeleted, [DateUpdated] = @DateUpdated, [UpdatedBy] = @UpdatedBy
      WHERE [ID] = @id
    `, { id, ...softDelete });

    return response.success(res, null, 'Proposal deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllProposals, getProposalById, createProposal, updateProposal, deleteProposal };
