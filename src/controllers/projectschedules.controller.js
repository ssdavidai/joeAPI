const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const response = require('../utils/response');
const { getAuditValues } = require('../middleware/audit');

const getAllProjectSchedules = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM dbo.[ProjectSchedules]`);
    const dataResult = await executeQuery(`
      SELECT * FROM dbo.[ProjectSchedules]
      ORDER BY [StartDate] DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `, { offset, limit });

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

const getProjectScheduleById = async (req, res, next) => {
  try {
    const result = await executeQuery(`SELECT * FROM dbo.[ProjectSchedules] WHERE [Id] = @id`, { id: req.params.id });
    if (result.recordset.length === 0) return response.error(res, 'ProjectSchedule not found', 404);
    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const createProjectSchedule = async (req, res, next) => {
  try {
    const id = uuidv4();
    const audit = getAuditValues(req.user, 'create');

    const result = await executeQuery(`
      INSERT INTO dbo.[ProjectSchedules] ([Id], [ProjectId], [Status], [StartDate], [CreatedBy], [DateCreated])
      VALUES (@id, @ProjectId, @Status, @StartDate, @CreatedBy, @DateCreated);
      SELECT * FROM dbo.[ProjectSchedules] WHERE [Id] = @id
    `, {
      id,
      ProjectId: req.body.ProjectId || null,
      Status: req.body.Status || null,
      StartDate: req.body.StartDate,
      CreatedBy: audit.CreatedBy,
      DateCreated: audit.DateCreated
    });

    return response.success(res, result.recordset[0], 'ProjectSchedule created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateProjectSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ProjectSchedules] WHERE [Id] = @id`, { id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ProjectSchedule not found', 404);

    const audit = getAuditValues(req.user, 'update');
    const updates = Object.keys(req.body).map(k => `[${k}] = @${k}`);
    updates.push('[UpdatedBy] = @UpdatedBy', '[DateUpdated] = @DateUpdated');

    const result = await executeQuery(`
      UPDATE dbo.[ProjectSchedules] SET ${updates.join(', ')} WHERE [Id] = @id;
      SELECT * FROM dbo.[ProjectSchedules] WHERE [Id] = @id
    `, { id, ...req.body, UpdatedBy: audit.UpdatedBy, DateUpdated: audit.DateUpdated });

    return response.success(res, result.recordset[0], 'ProjectSchedule updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteProjectSchedule = async (req, res, next) => {
  try {
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ProjectSchedules] WHERE [Id] = @id`, { id: req.params.id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ProjectSchedule not found', 404);

    await executeQuery(`DELETE FROM dbo.[ProjectSchedules] WHERE [Id] = @id`, { id: req.params.id });
    return response.success(res, null, 'ProjectSchedule deleted successfully');
  } catch (error) {
    if (error.number === 547) return response.error(res, 'Cannot delete - referenced by other records', 400);
    next(error);
  }
};

module.exports = { getAllProjectSchedules, getProjectScheduleById, createProjectSchedule, updateProjectSchedule, deleteProjectSchedule };
