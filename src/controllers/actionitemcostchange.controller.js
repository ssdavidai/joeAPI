const { executeQuery } = require('../config/database');
const response = require('../utils/response');

const getCostChange = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;

    // Verify action item exists and is type 1 (Cost Change)
    const checkResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItems]
      WHERE [Id] = @actionItemId AND [IsDeleted] = 0 AND [ActionTypeId] = 1
    `, { actionItemId });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'ActionItem not found or is not a Cost Change type', 404);
    }

    const result = await executeQuery(`
      SELECT aicc.*, ec.Name as EstimateCategoryName
      FROM dbo.[ActionItemCostChange] aicc
      LEFT JOIN dbo.[EstimateCategories] ec ON aicc.EstimateCategoryId = ec.ID
      WHERE aicc.ActionItemId = @actionItemId
    `, { actionItemId });

    if (result.recordset.length === 0) {
      return response.error(res, 'Cost change data not found', 404);
    }

    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const createCostChange = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;
    const { Amount, EstimateCategoryId, RequiresClientApproval } = req.body;

    // Verify action item exists and is type 1 (Cost Change)
    const checkResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItems]
      WHERE [Id] = @actionItemId AND [IsDeleted] = 0 AND [ActionTypeId] = 1
    `, { actionItemId });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'ActionItem not found or is not a Cost Change type', 404);
    }

    // Check if cost change already exists
    const existingResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItemCostChange]
      WHERE [ActionItemId] = @actionItemId
    `, { actionItemId });

    if (existingResult.recordset[0].cnt > 0) {
      return response.error(res, 'Cost change already exists for this action item. Use PUT to update.', 400);
    }

    const result = await executeQuery(`
      INSERT INTO dbo.[ActionItemCostChange] ([ActionItemId], [Amount], [EstimateCategoryId], [RequiresClientApproval])
      OUTPUT INSERTED.*
      VALUES (@ActionItemId, @Amount, @EstimateCategoryId, @RequiresClientApproval)
    `, {
      ActionItemId: actionItemId,
      Amount,
      EstimateCategoryId,
      RequiresClientApproval: RequiresClientApproval !== undefined ? RequiresClientApproval : true
    });

    return response.success(res, result.recordset[0], 'Cost change created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateCostChange = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;
    const { Amount, EstimateCategoryId, RequiresClientApproval } = req.body;

    // Verify cost change exists
    const checkResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItemCostChange]
      WHERE [ActionItemId] = @actionItemId
    `, { actionItemId });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'Cost change not found', 404);
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const params = { actionItemId };

    if (Amount !== undefined) {
      updates.push('[Amount] = @Amount');
      params.Amount = Amount;
    }
    if (EstimateCategoryId !== undefined) {
      updates.push('[EstimateCategoryId] = @EstimateCategoryId');
      params.EstimateCategoryId = EstimateCategoryId;
    }
    if (RequiresClientApproval !== undefined) {
      updates.push('[RequiresClientApproval] = @RequiresClientApproval');
      params.RequiresClientApproval = RequiresClientApproval;
    }

    if (updates.length === 0) {
      return response.error(res, 'No fields to update', 400);
    }

    const result = await executeQuery(`
      UPDATE dbo.[ActionItemCostChange]
      SET ${updates.join(', ')}
      WHERE [ActionItemId] = @actionItemId;
      SELECT aicc.*, ec.Name as EstimateCategoryName
      FROM dbo.[ActionItemCostChange] aicc
      LEFT JOIN dbo.[EstimateCategories] ec ON aicc.EstimateCategoryId = ec.ID
      WHERE aicc.ActionItemId = @actionItemId
    `, params);

    return response.success(res, result.recordset[0], 'Cost change updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteCostChange = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;

    // Verify cost change exists
    const checkResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItemCostChange]
      WHERE [ActionItemId] = @actionItemId
    `, { actionItemId });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'Cost change not found', 404);
    }

    await executeQuery(`DELETE FROM dbo.[ActionItemCostChange] WHERE [ActionItemId] = @actionItemId`, { actionItemId });

    return response.success(res, null, 'Cost change deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getCostChange, createCostChange, updateCostChange, deleteCostChange };
