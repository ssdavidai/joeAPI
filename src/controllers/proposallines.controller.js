/**
 * ProposalLines Controller
 * FKs: ProposalID -> Proposals, EstimateCategoryID -> EstimateCategories, ParentEstimateCategoryID -> EstimateCategories
 * No multi-tenancy, hard delete
 */

const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const response = require('../utils/response');

// Validate FK exists (no user check since these tables don't have UserId)
const validateFK = async (table, column, value) => {
  if (!value) return true; // NULL is allowed for optional FKs
  const result = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[${table}] WHERE [${column}] = @value`, { value });
  return result.recordset[0].cnt > 0;
};

const getAllProposalLines = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, proposalId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = proposalId ? 'WHERE [ProposalID] = @proposalId' : '';
    const params = { offset, limit };
    if (proposalId) params.proposalId = proposalId;

    const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM dbo.[ProposalLines] ${whereClause}`, params);
    const dataResult = await executeQuery(`
      SELECT * FROM dbo.[ProposalLines] ${whereClause}
      ORDER BY [Sequence] ASC, [Created] DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `, params);

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

const getProposalLineById = async (req, res, next) => {
  try {
    const result = await executeQuery(`SELECT * FROM dbo.[ProposalLines] WHERE [ID] = @id`, { id: req.params.id });
    if (result.recordset.length === 0) return response.error(res, 'ProposalLine not found', 404);
    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const createProposalLine = async (req, res, next) => {
  try {
    const { ProposalID, EstimateCategoryID, ParentEstimateCategoryID } = req.body;

    // Validate FKs
    if (!(await validateFK('Proposals', 'ID', ProposalID))) {
      return response.error(res, 'Invalid ProposalID - proposal not found', 400);
    }
    if (!(await validateFK('EstimateCategories', 'ID', EstimateCategoryID))) {
      return response.error(res, 'Invalid EstimateCategoryID - category not found', 400);
    }
    if (ParentEstimateCategoryID && !(await validateFK('EstimateCategories', 'ID', ParentEstimateCategoryID))) {
      return response.error(res, 'Invalid ParentEstimateCategoryID - category not found', 400);
    }

    const id = uuidv4();
    const now = new Date();
    const createdBy = req.user.email || req.user.userId.toString();

    const result = await executeQuery(`
      INSERT INTO dbo.[ProposalLines] (
        [ID], [ProposalID], [EstimateCategoryID], [ParentEstimateCategoryID],
        [Name], [Description], [Amount], [SqFoot], [Multiplier], [Percentage], [Sequence], [SqFootLocked],
        [Created], [CreatedBy]
      )
      VALUES (
        @id, @ProposalID, @EstimateCategoryID, @ParentEstimateCategoryID,
        @Name, @Description, @Amount, @SqFoot, @Multiplier, @Percentage, @Sequence, @SqFootLocked,
        @Created, @CreatedBy
      );
      SELECT * FROM dbo.[ProposalLines] WHERE [ID] = @id
    `, {
      id,
      ProposalID,
      EstimateCategoryID,
      ParentEstimateCategoryID: ParentEstimateCategoryID || null,
      Name: req.body.Name || null,
      Description: req.body.Description || null,
      Amount: req.body.Amount,
      SqFoot: req.body.SqFoot || null,
      Multiplier: req.body.Multiplier || null,
      Percentage: req.body.Percentage || null,
      Sequence: req.body.Sequence || null,
      SqFootLocked: req.body.SqFootLocked || false,
      Created: now,
      CreatedBy: createdBy
    });

    return response.success(res, result.recordset[0], 'ProposalLine created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateProposalLine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ProposalID, EstimateCategoryID, ParentEstimateCategoryID } = req.body;

    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ProposalLines] WHERE [ID] = @id`, { id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ProposalLine not found', 404);

    // Validate FKs if being updated
    if (ProposalID !== undefined && !(await validateFK('Proposals', 'ID', ProposalID))) {
      return response.error(res, 'Invalid ProposalID - proposal not found', 400);
    }
    if (EstimateCategoryID !== undefined && !(await validateFK('EstimateCategories', 'ID', EstimateCategoryID))) {
      return response.error(res, 'Invalid EstimateCategoryID - category not found', 400);
    }
    if (ParentEstimateCategoryID !== undefined && ParentEstimateCategoryID && !(await validateFK('EstimateCategories', 'ID', ParentEstimateCategoryID))) {
      return response.error(res, 'Invalid ParentEstimateCategoryID - category not found', 400);
    }

    const updates = Object.keys(req.body).map(k => `[${k}] = @${k}`);
    updates.push('[Updated] = @Updated', '[UpdatedBy] = @UpdatedBy');

    const result = await executeQuery(`
      UPDATE dbo.[ProposalLines] SET ${updates.join(', ')} WHERE [ID] = @id;
      SELECT * FROM dbo.[ProposalLines] WHERE [ID] = @id
    `, {
      id,
      ...req.body,
      Updated: new Date(),
      UpdatedBy: req.user.email || req.user.userId.toString()
    });

    return response.success(res, result.recordset[0], 'ProposalLine updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteProposalLine = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ProposalLines] WHERE [ID] = @id`, { id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ProposalLine not found', 404);

    await executeQuery(`DELETE FROM dbo.[ProposalLines] WHERE [ID] = @id`, { id });
    return response.success(res, null, 'ProposalLine deleted successfully');
  } catch (error) {
    if (error.number === 547) return response.error(res, 'Cannot delete - referenced by other records', 400);
    next(error);
  }
};

module.exports = { getAllProposalLines, getProposalLineById, createProposalLine, updateProposalLine, deleteProposalLine };
