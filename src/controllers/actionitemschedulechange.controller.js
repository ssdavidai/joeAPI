const { executeQuery } = require('../config/database');
const response = require('../utils/response');

const getScheduleChange = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;

    // Verify action item exists and is type 2 (Schedule Change)
    const checkResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItems]
      WHERE [Id] = @actionItemId AND [IsDeleted] = 0 AND [ActionTypeId] = 2
    `, { actionItemId });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'ActionItem not found or is not a Schedule Change type', 404);
    }

    const result = await executeQuery(`
      SELECT aisc.*, ct.Name as ConstructionTaskName
      FROM dbo.[ActionItemScheduleChange] aisc
      LEFT JOIN dbo.[ConstructionTasks] ct ON aisc.ConstructionTaskId = ct.ID
      WHERE aisc.ActionItemId = @actionItemId
    `, { actionItemId });

    if (result.recordset.length === 0) {
      return response.error(res, 'Schedule change data not found', 404);
    }

    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const createScheduleChange = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;
    const { NoOfDays, ConstructionTaskId, RequiresClientApproval } = req.body;

    // Verify action item exists and is type 2 (Schedule Change)
    const checkResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItems]
      WHERE [Id] = @actionItemId AND [IsDeleted] = 0 AND [ActionTypeId] = 2
    `, { actionItemId });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'ActionItem not found or is not a Schedule Change type', 404);
    }

    // Check if schedule change already exists
    const existingResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItemScheduleChange]
      WHERE [ActionItemId] = @actionItemId
    `, { actionItemId });

    if (existingResult.recordset[0].cnt > 0) {
      return response.error(res, 'Schedule change already exists for this action item. Use PUT to update.', 400);
    }

    const result = await executeQuery(`
      INSERT INTO dbo.[ActionItemScheduleChange] ([ActionItemId], [NoOfDays], [ConstructionTaskId], [RequiresClientApproval])
      OUTPUT INSERTED.*
      VALUES (@ActionItemId, @NoOfDays, @ConstructionTaskId, @RequiresClientApproval)
    `, {
      ActionItemId: actionItemId,
      NoOfDays,
      ConstructionTaskId,
      RequiresClientApproval: RequiresClientApproval !== undefined ? RequiresClientApproval : true
    });

    return response.success(res, result.recordset[0], 'Schedule change created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateScheduleChange = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;
    const { NoOfDays, ConstructionTaskId, RequiresClientApproval } = req.body;

    // Verify schedule change exists
    const checkResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItemScheduleChange]
      WHERE [ActionItemId] = @actionItemId
    `, { actionItemId });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'Schedule change not found', 404);
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const params = { actionItemId };

    if (NoOfDays !== undefined) {
      updates.push('[NoOfDays] = @NoOfDays');
      params.NoOfDays = NoOfDays;
    }
    if (ConstructionTaskId !== undefined) {
      updates.push('[ConstructionTaskId] = @ConstructionTaskId');
      params.ConstructionTaskId = ConstructionTaskId;
    }
    if (RequiresClientApproval !== undefined) {
      updates.push('[RequiresClientApproval] = @RequiresClientApproval');
      params.RequiresClientApproval = RequiresClientApproval;
    }

    if (updates.length === 0) {
      return response.error(res, 'No fields to update', 400);
    }

    const result = await executeQuery(`
      UPDATE dbo.[ActionItemScheduleChange]
      SET ${updates.join(', ')}
      WHERE [ActionItemId] = @actionItemId;
      SELECT aisc.*, ct.Name as ConstructionTaskName
      FROM dbo.[ActionItemScheduleChange] aisc
      LEFT JOIN dbo.[ConstructionTasks] ct ON aisc.ConstructionTaskId = ct.ID
      WHERE aisc.ActionItemId = @actionItemId
    `, params);

    return response.success(res, result.recordset[0], 'Schedule change updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteScheduleChange = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;

    // Verify schedule change exists
    const checkResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItemScheduleChange]
      WHERE [ActionItemId] = @actionItemId
    `, { actionItemId });

    if (checkResult.recordset[0].cnt === 0) {
      return response.error(res, 'Schedule change not found', 404);
    }

    await executeQuery(`DELETE FROM dbo.[ActionItemScheduleChange] WHERE [ActionItemId] = @actionItemId`, { actionItemId });

    return response.success(res, null, 'Schedule change deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getScheduleChange, createScheduleChange, updateScheduleChange, deleteScheduleChange };
