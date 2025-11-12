const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const response = require('../utils/response');
const { getAuditValues } = require('../middleware/audit');

const validateFK = async (table, column, value) => {
  if (!value) return true;
  const result = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[${table}] WHERE [${column}] = @value`, { value });
  return result.recordset[0].cnt > 0;
};

const getAllProjectScheduleTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, scheduleId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = scheduleId ? 'WHERE [ProjectScheduleId] = @scheduleId' : '';
    const params = { offset, limit };
    if (scheduleId) params.scheduleId = scheduleId;

    const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM dbo.[ProjectScheduleTasks] ${whereClause}`, params);
    const dataResult = await executeQuery(`
      SELECT * FROM dbo.[ProjectScheduleTasks] ${whereClause}
      ORDER BY [Sequence] ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `, params);

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

const getProjectScheduleTaskById = async (req, res, next) => {
  try {
    const result = await executeQuery(`SELECT * FROM dbo.[ProjectScheduleTasks] WHERE [Id] = @id`, { id: req.params.id });
    if (result.recordset.length === 0) return response.error(res, 'ProjectScheduleTask not found', 404);
    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const createProjectScheduleTask = async (req, res, next) => {
  try {
    const { ProjectScheduleId } = req.body;

    // Validate FK
    if (!(await validateFK('ProjectSchedules', 'Id', ProjectScheduleId))) {
      return response.error(res, 'Invalid ProjectScheduleId - schedule not found', 400);
    }

    const id = uuidv4();
    const audit = getAuditValues(req.user, 'create');

    const result = await executeQuery(`
      INSERT INTO dbo.[ProjectScheduleTasks] (
        [Id], [ProjectScheduleId], [ConstructionTaskId], [Name], [Sequence], [Duration], [StartDate], [EndDate],
        [Pred1], [Lag1], [Pred2], [Lag2], [Pred3], [Lag3], [CreatedBy], [DateCreated]
      )
      VALUES (
        @id, @ProjectScheduleId, @ConstructionTaskId, @Name, @Sequence, @Duration, @StartDate, @EndDate,
        @Pred1, @Lag1, @Pred2, @Lag2, @Pred3, @Lag3, @CreatedBy, @DateCreated
      );
      SELECT * FROM dbo.[ProjectScheduleTasks] WHERE [Id] = @id
    `, {
      id,
      ...req.body,
      Pred1: req.body.Pred1 || null,
      Lag1: req.body.Lag1 || null,
      Pred2: req.body.Pred2 || null,
      Lag2: req.body.Lag2 || null,
      Pred3: req.body.Pred3 || null,
      Lag3: req.body.Lag3 || null,
      CreatedBy: audit.CreatedBy,
      DateCreated: audit.DateCreated
    });

    return response.success(res, result.recordset[0], 'ProjectScheduleTask created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateProjectScheduleTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ProjectScheduleId } = req.body;

    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ProjectScheduleTasks] WHERE [Id] = @id`, { id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ProjectScheduleTask not found', 404);

    // Validate FK if being updated
    if (ProjectScheduleId !== undefined && !(await validateFK('ProjectSchedules', 'Id', ProjectScheduleId))) {
      return response.error(res, 'Invalid ProjectScheduleId - schedule not found', 400);
    }

    const audit = getAuditValues(req.user, 'update');
    const updates = Object.keys(req.body).map(k => `[${k}] = @${k}`);
    updates.push('[UpdatedBy] = @UpdatedBy', '[DateUpdated] = @DateUpdated');

    const result = await executeQuery(`
      UPDATE dbo.[ProjectScheduleTasks] SET ${updates.join(', ')} WHERE [Id] = @id;
      SELECT * FROM dbo.[ProjectScheduleTasks] WHERE [Id] = @id
    `, { id, ...req.body, UpdatedBy: audit.UpdatedBy, DateUpdated: audit.DateUpdated });

    return response.success(res, result.recordset[0], 'ProjectScheduleTask updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteProjectScheduleTask = async (req, res, next) => {
  try {
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ProjectScheduleTasks] WHERE [Id] = @id`, { id: req.params.id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ProjectScheduleTask not found', 404);

    await executeQuery(`DELETE FROM dbo.[ProjectScheduleTasks] WHERE [Id] = @id`, { id: req.params.id });
    return response.success(res, null, 'ProjectScheduleTask deleted successfully');
  } catch (error) {
    if (error.number === 547) return response.error(res, 'Cannot delete - referenced by other records', 400);
    next(error);
  }
};

module.exports = { getAllProjectScheduleTasks, getProjectScheduleTaskById, createProjectScheduleTask, updateProjectScheduleTask, deleteProjectScheduleTask };
