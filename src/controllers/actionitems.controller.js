const { executeQuery } = require('../config/database');
const response = require('../utils/response');
const { getAuditValues, getSoftDeleteValues } = require('../middleware/audit');

const getAllActionItems = async (req, res, next) => {
  console.log('[CONTROLLER] getAllActionItems called - Method:', req.method, 'Path:', req.path);
  try {
    const { page = 1, limit = 20, projectId = '', includeDeleted = false, includeArchived = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = includeDeleted ? '' : 'WHERE [IsDeleted] = 0';
    if (!includeArchived) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ') + '[IsArchived] = 0';
    }
    const params = { offset, limit };

    if (projectId) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ') + '[ProjectId] = @projectId';
      params.projectId = projectId;
    }

    const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM dbo.[ActionItems] ${whereClause}`, params);
    const dataResult = await executeQuery(`
      SELECT * FROM dbo.[ActionItems] ${whereClause}
      ORDER BY [DueDate] ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `, params);

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

const getActionItemById = async (req, res, next) => {
  try {
    const result = await executeQuery(`SELECT * FROM dbo.[ActionItems] WHERE [Id] = @id AND [IsDeleted] = 0`, { id: req.params.id });
    if (result.recordset.length === 0) return response.error(res, 'ActionItem not found', 404);
    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const createActionItem = async (req, res, next) => {
  console.log('[CONTROLLER] createActionItem called - Method:', req.method, 'Body:', JSON.stringify(req.body));
  try {
    const audit = getAuditValues(req.user, 'create');

    const result = await executeQuery(`
      INSERT INTO dbo.[ActionItems] (
        [Title], [Description], [ProjectId], [ActionTypeId], [DueDate], [Status], [Source], [IsArchived], [AcceptedBy],
        [IsDeleted], [DateCreated], [CreatedBy]
      )
      OUTPUT INSERTED.*
      VALUES (
        @Title, @Description, @ProjectId, @ActionTypeId, @DueDate, @Status, @Source, @IsArchived, @AcceptedBy,
        0, @DateCreated, @CreatedBy
      )
    `, {
      ...req.body,
      ProjectId: req.body.ProjectId || null,
      IsArchived: req.body.IsArchived || false,
      AcceptedBy: req.body.AcceptedBy || null,
      DateCreated: audit.DateCreated,
      CreatedBy: audit.CreatedBy
    });

    return response.success(res, result.recordset[0], 'ActionItem created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateActionItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ActionItems] WHERE [Id] = @id AND [IsDeleted] = 0`, { id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ActionItem not found', 404);

    const audit = getAuditValues(req.user, 'update');
    const updates = Object.keys(req.body).map(k => `[${k}] = @${k}`);
    updates.push('[DateUpdated] = @DateUpdated', '[UpdatedBy] = @UpdatedBy');

    const result = await executeQuery(`
      UPDATE dbo.[ActionItems] SET ${updates.join(', ')} WHERE [Id] = @id;
      SELECT * FROM dbo.[ActionItems] WHERE [Id] = @id
    `, { id, ...req.body, DateUpdated: audit.DateUpdated, UpdatedBy: audit.UpdatedBy });

    return response.success(res, result.recordset[0], 'ActionItem updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteActionItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ActionItems] WHERE [Id] = @id AND [IsDeleted] = 0`, { id });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ActionItem not found', 404);

    const softDelete = getSoftDeleteValues(req.user, 'IsDeleted');
    await executeQuery(`
      UPDATE dbo.[ActionItems]
      SET [IsDeleted] = @IsDeleted, [DateUpdated] = @DateUpdated, [UpdatedBy] = @UpdatedBy
      WHERE [Id] = @id
    `, { id, ...softDelete });

    return response.success(res, null, 'ActionItem deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllActionItems, getActionItemById, createActionItem, updateActionItem, deleteActionItem };
