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
    const { id } = req.params;

    // Get base action item
    const result = await executeQuery(`SELECT * FROM dbo.[ActionItems] WHERE [Id] = @id AND [IsDeleted] = 0`, { id });
    if (result.recordset.length === 0) return response.error(res, 'ActionItem not found', 404);

    const actionItem = result.recordset[0];

    // Get cost change data if exists
    const costChangeResult = await executeQuery(`
      SELECT aicc.*, ec.Name as EstimateCategoryName
      FROM dbo.[ActionItemCostChange] aicc
      LEFT JOIN dbo.[EstimateCategories] ec ON aicc.EstimateCategoryId = ec.ID
      WHERE aicc.ActionItemId = @id
    `, { id });
    actionItem.CostChange = costChangeResult.recordset.length > 0 ? costChangeResult.recordset[0] : null;

    // Get schedule change data if exists
    const scheduleChangeResult = await executeQuery(`
      SELECT aisc.*, ct.Name as ConstructionTaskName
      FROM dbo.[ActionItemScheduleChange] aisc
      LEFT JOIN dbo.[ConstructionTasks] ct ON aisc.ConstructionTaskId = ct.ID
      WHERE aisc.ActionItemId = @id
    `, { id });
    actionItem.ScheduleChange = scheduleChangeResult.recordset.length > 0 ? scheduleChangeResult.recordset[0] : null;

    // Get comments
    const commentsResult = await executeQuery(`
      SELECT * FROM dbo.[ActionItemComments]
      WHERE ActionItemId = @id
      ORDER BY DateCreated ASC
    `, { id });
    actionItem.Comments = commentsResult.recordset;

    // Get supervisors
    const supervisorsResult = await executeQuery(`
      SELECT * FROM dbo.[ActionItemsSupervisors]
      WHERE ActionItemId = @id
      ORDER BY DateCreated ASC
    `, { id });
    actionItem.Supervisors = supervisorsResult.recordset;

    return response.success(res, actionItem);
  } catch (error) {
    next(error);
  }
};

const createActionItem = async (req, res, next) => {
  console.log('[CONTROLLER] createActionItem called - Method:', req.method, 'Body:', JSON.stringify(req.body));
  try {
    const audit = getAuditValues(req.user, 'create');
    const { CostChange, ScheduleChange, SupervisorIds, InitialComment, ...actionItemData } = req.body;

    // Create base ActionItem
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
      ...actionItemData,
      ProjectId: actionItemData.ProjectId || null,
      IsArchived: actionItemData.IsArchived || false,
      AcceptedBy: actionItemData.AcceptedBy || null,
      DateCreated: audit.DateCreated,
      CreatedBy: audit.CreatedBy
    });

    const createdActionItem = result.recordset[0];
    const actionItemId = createdActionItem.Id;

    // Create CostChange if provided (for ActionTypeId = 1)
    if (CostChange && actionItemData.ActionTypeId === 1) {
      await executeQuery(`
        INSERT INTO dbo.[ActionItemCostChange] ([ActionItemId], [Amount], [EstimateCategoryId], [RequiresClientApproval])
        VALUES (@ActionItemId, @Amount, @EstimateCategoryId, @RequiresClientApproval)
      `, {
        ActionItemId: actionItemId,
        Amount: CostChange.Amount,
        EstimateCategoryId: CostChange.EstimateCategoryId,
        RequiresClientApproval: CostChange.RequiresClientApproval !== undefined ? CostChange.RequiresClientApproval : true
      });
    }

    // Create ScheduleChange if provided (for ActionTypeId = 2)
    if (ScheduleChange && actionItemData.ActionTypeId === 2) {
      await executeQuery(`
        INSERT INTO dbo.[ActionItemScheduleChange] ([ActionItemId], [NoOfDays], [ConstructionTaskId], [RequiresClientApproval])
        VALUES (@ActionItemId, @NoOfDays, @ConstructionTaskId, @RequiresClientApproval)
      `, {
        ActionItemId: actionItemId,
        NoOfDays: ScheduleChange.NoOfDays,
        ConstructionTaskId: ScheduleChange.ConstructionTaskId,
        RequiresClientApproval: ScheduleChange.RequiresClientApproval !== undefined ? ScheduleChange.RequiresClientApproval : true
      });
    }

    // Create Supervisor assignments if provided
    if (SupervisorIds && Array.isArray(SupervisorIds) && SupervisorIds.length > 0) {
      for (const supervisorId of SupervisorIds) {
        await executeQuery(`
          INSERT INTO dbo.[ActionItemsSupervisors] ([Id], [ActionItemId], [SupervisorId], [CreatedBy], [DateCreated], [DateUpdated])
          VALUES (NEWID(), @ActionItemId, @SupervisorId, @CreatedBy, @DateCreated, @DateUpdated)
        `, {
          ActionItemId: actionItemId,
          SupervisorId: supervisorId,
          CreatedBy: audit.CreatedBy,
          DateCreated: audit.DateCreated,
          DateUpdated: audit.DateCreated
        });
      }
    }

    // Create initial comment if provided
    if (InitialComment) {
      await executeQuery(`
        INSERT INTO dbo.[ActionItemComments] ([ActionItemId], [Comment], [DateCreated], [CreatedBy], [DateUpdated])
        VALUES (@ActionItemId, @Comment, @DateCreated, @CreatedBy, @DateUpdated)
      `, {
        ActionItemId: actionItemId,
        Comment: InitialComment,
        DateCreated: audit.DateCreated,
        CreatedBy: audit.CreatedBy,
        DateUpdated: audit.DateCreated
      });
    }

    // Fetch the complete action item with all related data
    const completeResult = await executeQuery(`SELECT * FROM dbo.[ActionItems] WHERE [Id] = @id`, { id: actionItemId });
    const actionItem = completeResult.recordset[0];

    // Get cost change data if exists
    const costChangeResult = await executeQuery(`
      SELECT aicc.*, ec.Name as EstimateCategoryName
      FROM dbo.[ActionItemCostChange] aicc
      LEFT JOIN dbo.[EstimateCategories] ec ON aicc.EstimateCategoryId = ec.ID
      WHERE aicc.ActionItemId = @id
    `, { id: actionItemId });
    actionItem.CostChange = costChangeResult.recordset.length > 0 ? costChangeResult.recordset[0] : null;

    // Get schedule change data if exists
    const scheduleChangeResult = await executeQuery(`
      SELECT aisc.*, ct.Name as ConstructionTaskName
      FROM dbo.[ActionItemScheduleChange] aisc
      LEFT JOIN dbo.[ConstructionTasks] ct ON aisc.ConstructionTaskId = ct.ID
      WHERE aisc.ActionItemId = @id
    `, { id: actionItemId });
    actionItem.ScheduleChange = scheduleChangeResult.recordset.length > 0 ? scheduleChangeResult.recordset[0] : null;

    // Get comments
    const commentsResult = await executeQuery(`
      SELECT * FROM dbo.[ActionItemComments]
      WHERE ActionItemId = @id
      ORDER BY DateCreated ASC
    `, { id: actionItemId });
    actionItem.Comments = commentsResult.recordset;

    // Get supervisors
    const supervisorsResult = await executeQuery(`
      SELECT * FROM dbo.[ActionItemsSupervisors]
      WHERE ActionItemId = @id
      ORDER BY DateCreated ASC
    `, { id: actionItemId });
    actionItem.Supervisors = supervisorsResult.recordset;

    return response.success(res, actionItem, 'ActionItem created successfully', 201);
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
