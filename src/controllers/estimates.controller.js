const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const response = require('../utils/response');

const getAllEstimates = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM dbo.[Estimates]`);
    const dataResult = await executeQuery(`
      SELECT * FROM dbo.[Estimates]
      ORDER BY [Created] DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `, { offset, limit });

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

const getEstimateById = async (req, res, next) => {
  try {
    const result = await executeQuery(`SELECT * FROM dbo.[Estimates] WHERE [ID] = @id`, { id: req.params.id });
    if (result.recordset.length === 0) return response.error(res, 'Estimate not found', 404);
    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const createEstimate = async (req, res, next) => {
  try {
    const id = uuidv4();
    const now = new Date();
    const createdBy = req.user.email || req.user.userId.toString();

    const result = await executeQuery(`
      INSERT INTO dbo.[Estimates] ([ID], [Amount], [EstimateSubCategoryID], [QBClassID], [ProjectCompletionDate], [Created], [CreatedBy])
      VALUES (@id, @Amount, @EstimateSubCategoryID, @QBClassID, @ProjectCompletionDate, @Created, @CreatedBy);
      SELECT * FROM dbo.[Estimates] WHERE [ID] = @id
    `, {
      id,
      Amount: req.body.Amount || null,
      EstimateSubCategoryID: req.body.EstimateSubCategoryID || null,
      QBClassID: req.body.QBClassID || null,
      ProjectCompletionDate: req.body.ProjectCompletionDate || null,
      Created: now,
      CreatedBy: createdBy
    });

    return response.success(res, result.recordset[0], 'Estimate created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateEstimate = async (req, res, next) => {
  try {
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[Estimates] WHERE [ID] = @id`, { id: req.params.id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'Estimate not found', 404);

    const updates = Object.keys(req.body).map(k => `[${k}] = @${k}`);
    updates.push('[Updated] = @Updated', '[UpdatedBy] = @UpdatedBy');

    const result = await executeQuery(`
      UPDATE dbo.[Estimates] SET ${updates.join(', ')} WHERE [ID] = @id;
      SELECT * FROM dbo.[Estimates] WHERE [ID] = @id
    `, {
      id: req.params.id,
      ...req.body,
      Updated: new Date(),
      UpdatedBy: req.user.email || req.user.userId.toString()
    });

    return response.success(res, result.recordset[0], 'Estimate updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteEstimate = async (req, res, next) => {
  try {
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[Estimates] WHERE [ID] = @id`, { id: req.params.id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'Estimate not found', 404);

    await executeQuery(`DELETE FROM dbo.[Estimates] WHERE [ID] = @id`, { id: req.params.id });
    return response.success(res, null, 'Estimate deleted successfully');
  } catch (error) {
    if (error.number === 547) return response.error(res, 'Cannot delete estimate - referenced by other records', 400);
    next(error);
  }
};

module.exports = { getAllEstimates, getEstimateById, createEstimate, updateEstimate, deleteEstimate };
