const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/job-balances
 * Get current job balances and receivables
 */
const getJobBalances = async (req, res, next) => {
  try {
    const { projectId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = { offset: parseInt(offset), limit: parseInt(limit) };

    if (projectId) {
      conditions.push('jb.[JobId] = @projectId');
      params.projectId = projectId;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM dbo.[JobBalances] jb
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, params);

    // Get job balances with project names
    const dataQuery = `
      SELECT
        jb.[Id],
        jb.[JobId] as projectId,
        jb.[Balance] as currentBalance,
        jb.[DateUpdated],
        qbc.[Name] AS projectName,
        qbc.[FullyQualifiedName] AS projectFullName
      FROM dbo.[JobBalances] jb
      LEFT JOIN dbo.[QBClasses] qbc ON jb.[JobId] = qbc.[ID]
      ${whereClause}
      ORDER BY jb.[DateUpdated] DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const dataResult = await executeQuery(dataQuery, params);

    // Transform data to match expected format
    const transformedData = dataResult.recordset.map(row => ({
      id: row.Id,
      projectId: row.projectId,
      projectName: row.projectName || 'Unknown Project',
      projectFullName: row.projectFullName,
      currentBalance: row.currentBalance || 0,
      dateUpdated: row.DateUpdated
    }));

    return response.paginated(res, transformedData, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/job-balances/:projectId
 * Get job balance for a specific project
 */
const getJobBalanceByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const query = `
      SELECT
        jb.[Id],
        jb.[JobId] as projectId,
        jb.[Balance] as currentBalance,
        jb.[DateUpdated],
        qbc.[Name] AS projectName,
        qbc.[FullyQualifiedName] AS projectFullName
      FROM dbo.[JobBalances] jb
      LEFT JOIN dbo.[QBClasses] qbc ON jb.[JobId] = qbc.[ID]
      WHERE jb.[JobId] = @projectId
    `;

    const result = await executeQuery(query, { projectId });

    if (result.recordset.length === 0) {
      return response.error(res, 'Job balance not found for this project', 404);
    }

    const row = result.recordset[0];
    const data = {
      id: row.Id,
      projectId: row.projectId,
      projectName: row.projectName || 'Unknown Project',
      projectFullName: row.projectFullName,
      currentBalance: row.currentBalance || 0,
      dateUpdated: row.DateUpdated
    };

    return response.success(res, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobBalances,
  getJobBalanceByProject
};
