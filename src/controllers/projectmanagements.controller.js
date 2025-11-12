const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const response = require('../utils/response');

const getAllProjectManagements = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM dbo.[ProjectManagements]`);
    const dataResult = await executeQuery(`
      SELECT * FROM dbo.[ProjectManagements]
      ORDER BY [StartDate] DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `, { offset, limit });

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

const getProjectManagementById = async (req, res, next) => {
  try {
    const result = await executeQuery(`SELECT * FROM dbo.[ProjectManagements] WHERE [ProjectManagementID] = @id`, { id: req.params.id });
    if (result.recordset.length === 0) return response.error(res, 'ProjectManagement not found', 404);
    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const createProjectManagement = async (req, res, next) => {
  try {
    const id = uuidv4();
    const result = await executeQuery(`
      INSERT INTO dbo.[ProjectManagements] (
        [ProjectManagementID], [QBClassID], [ConstructionTaskID], [Status], [ProgressPercentage], [Notes], [Description],
        [StartDate], [EndDate], [AssignedTo], [Pred1ID], [Pred1LagID], [Pred2ID], [Pred2LagID], [Pred3ID], [Pred3LagID]
      )
      VALUES (
        @id, @QBClassID, @ConstructionTaskID, @Status, @ProgressPercentage, @Notes, @Description,
        @StartDate, @EndDate, @AssignedTo, @Pred1ID, @Pred1LagID, @Pred2ID, @Pred2LagID, @Pred3ID, @Pred3LagID
      );
      SELECT * FROM dbo.[ProjectManagements] WHERE [ProjectManagementID] = @id
    `, { id, ...req.body });

    return response.success(res, result.recordset[0], 'ProjectManagement created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateProjectManagement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ProjectManagements] WHERE [ProjectManagementID] = @id`, { id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ProjectManagement not found', 404);

    const updates = Object.keys(req.body).map(k => `[${k}] = @${k}`);
    const result = await executeQuery(`
      UPDATE dbo.[ProjectManagements] SET ${updates.join(', ')} WHERE [ProjectManagementID] = @id;
      SELECT * FROM dbo.[ProjectManagements] WHERE [ProjectManagementID] = @id
    `, { id, ...req.body });

    return response.success(res, result.recordset[0], 'ProjectManagement updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteProjectManagement = async (req, res, next) => {
  try {
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ProjectManagements] WHERE [ProjectManagementID] = @id`, { id: req.params.id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ProjectManagement not found', 404);

    await executeQuery(`DELETE FROM dbo.[ProjectManagements] WHERE [ProjectManagementID] = @id`, { id: req.params.id });
    return response.success(res, null, 'ProjectManagement deleted successfully');
  } catch (error) {
    if (error.number === 547) return response.error(res, 'Cannot delete - referenced by other records', 400);
    next(error);
  }
};

module.exports = { getAllProjectManagements, getProjectManagementById, createProjectManagement, updateProjectManagement, deleteProjectManagement };
