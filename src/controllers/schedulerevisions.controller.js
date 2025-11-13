const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/schedule-revisions
 * Get schedule revision history
 */
const getScheduleRevisions = async (req, res, next) => {
  try {
    const { projectId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = { offset: parseInt(offset), limit: parseInt(limit) };

    if (projectId) {
      conditions.push('sr.[ProjectId] = @projectId');
      params.projectId = projectId;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) AS total FROM dbo.[ScheduleRevisions] sr ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);

    // Get schedule revisions with items
    const dataQuery = `
      SELECT
        sr.*,
        qbc.[Name] AS projectName,
        qbc.[FullyQualifiedName] AS projectFullName,
        (SELECT COUNT(*) FROM dbo.[ScheduleRevisionItems] WHERE [ScheduleRevisionId] = sr.[Id]) AS itemCount
      FROM dbo.[ScheduleRevisions] sr
      LEFT JOIN dbo.[QBClasses] qbc ON sr.[ProjectId] = qbc.[ID]
      ${whereClause}
      ORDER BY sr.[RevisionDate] DESC, sr.[RevisionNumber] DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const dataResult = await executeQuery(dataQuery, params);

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/schedule-revisions/:id
 * Get schedule revision by ID with items
 */
const getScheduleRevisionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get revision header
    const revisionQuery = `
      SELECT
        sr.*,
        qbc.[Name] AS projectName,
        qbc.[FullyQualifiedName] AS projectFullName
      FROM dbo.[ScheduleRevisions] sr
      LEFT JOIN dbo.[QBClasses] qbc ON sr.[ProjectId] = qbc.[ID]
      WHERE sr.[Id] = @id
    `;
    const revisionResult = await executeQuery(revisionQuery, { id });

    if (revisionResult.recordset.length === 0) {
      return response.error(res, 'Schedule revision not found', 404);
    }

    // Get revision items
    const itemsQuery = `
      SELECT
        sri.*,
        pst.[Name] AS taskName,
        pst.[Sequence] AS taskSequence
      FROM dbo.[ScheduleRevisionItems] sri
      LEFT JOIN dbo.[ProjectScheduleTasks] pst ON sri.[ConstructionTaskId] = pst.[ConstructionTaskId]
      WHERE sri.[ScheduleRevisionId] = @id
      ORDER BY sri.[Id]
    `;
    const itemsResult = await executeQuery(itemsQuery, { id });

    const revision = revisionResult.recordset[0];
    revision.items = itemsResult.recordset.map(item => ({
      ...item,
      taskId: item.ConstructionTaskId,
      taskName: item.taskName || 'Unknown Task',
      originalStartDate: item.OriginalStartDate,
      newStartDate: item.NewStartDate,
      originalEndDate: item.OriginalEndDate,
      newEndDate: item.NewEndDate,
      daysChanged: item.DaysChanged || 0
    }));

    // Calculate total days added
    const totalDaysAdded = revision.items.reduce((sum, item) => sum + (item.daysChanged || 0), 0);
    revision.totalDaysAdded = totalDaysAdded;

    return response.success(res, revision);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getScheduleRevisions,
  getScheduleRevisionById
};
