const { executeQuery } = require('../config/database');
const response = require('../utils/response');
const { getAuditValues } = require('../middleware/audit');

const getAllSupervisors = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;

    // Verify action item exists
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ActionItems] WHERE [Id] = @actionItemId AND [IsDeleted] = 0`, { actionItemId });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ActionItem not found', 404);

    const result = await executeQuery(`
      SELECT * FROM dbo.[ActionItemsSupervisors]
      WHERE [ActionItemId] = @actionItemId
      ORDER BY [DateCreated] ASC
    `, { actionItemId });

    return response.success(res, result.recordset);
  } catch (error) {
    next(error);
  }
};

const getSupervisorById = async (req, res, next) => {
  try {
    const { actionItemId, supervisorAssignmentId } = req.params;

    const result = await executeQuery(`
      SELECT * FROM dbo.[ActionItemsSupervisors]
      WHERE [Id] = @supervisorAssignmentId AND [ActionItemId] = @actionItemId
    `, { supervisorAssignmentId, actionItemId });

    if (result.recordset.length === 0) return response.error(res, 'Supervisor assignment not found', 404);
    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const assignSupervisor = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;
    const { SupervisorId } = req.body;
    const audit = getAuditValues(req.user, 'create');

    // Verify action item exists
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ActionItems] WHERE [Id] = @actionItemId AND [IsDeleted] = 0`, { actionItemId });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ActionItem not found', 404);

    // Check if supervisor is already assigned
    const existingResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItemsSupervisors]
      WHERE [ActionItemId] = @actionItemId AND [SupervisorId] = @SupervisorId
    `, { actionItemId, SupervisorId });

    if (existingResult.recordset[0].cnt > 0) {
      return response.error(res, 'Supervisor already assigned to this action item', 400);
    }

    const result = await executeQuery(`
      INSERT INTO dbo.[ActionItemsSupervisors] ([Id], [ActionItemId], [SupervisorId], [CreatedBy], [DateCreated], [DateUpdated])
      OUTPUT INSERTED.*
      VALUES (NEWID(), @ActionItemId, @SupervisorId, @CreatedBy, @DateCreated, @DateUpdated)
    `, {
      ActionItemId: actionItemId,
      SupervisorId,
      CreatedBy: audit.CreatedBy,
      DateCreated: audit.DateCreated,
      DateUpdated: audit.DateCreated
    });

    return response.success(res, result.recordset[0], 'Supervisor assigned successfully', 201);
  } catch (error) {
    next(error);
  }
};

const removeSupervisor = async (req, res, next) => {
  try {
    const { actionItemId, supervisorAssignmentId } = req.params;

    // Verify supervisor assignment exists
    const checkResult = await executeQuery(`
      SELECT COUNT(*) AS cnt FROM dbo.[ActionItemsSupervisors]
      WHERE [Id] = @supervisorAssignmentId AND [ActionItemId] = @actionItemId
    `, { supervisorAssignmentId, actionItemId });

    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'Supervisor assignment not found', 404);

    await executeQuery(`DELETE FROM dbo.[ActionItemsSupervisors] WHERE [Id] = @supervisorAssignmentId`, { supervisorAssignmentId });

    return response.success(res, null, 'Supervisor removed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSupervisors, getSupervisorById, assignSupervisor, removeSupervisor };
