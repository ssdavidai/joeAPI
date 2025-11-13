const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/estimates/revision-history
 * Get estimate revision history with average overage
 */
const getEstimateRevisionHistory = async (req, res, next) => {
  try {
    const { projectId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = { offset: parseInt(offset), limit: parseInt(limit) };

    if (projectId) {
      conditions.push('e.[QBClassID] = @projectId');
      params.projectId = projectId;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get revisions with cost changes
    const dataQuery = `
      SELECT
        e.[QBClassID] AS projectId,
        qbc.[Name] AS projectName,
        SUM(e.[Amount]) AS originalEstimate,
        (
          SELECT SUM(aicc.[Amount])
          FROM dbo.[ActionItemCostChange] aicc
          INNER JOIN dbo.[ActionItems] ai ON aicc.[ActionItemId] = ai.[Id]
          WHERE ai.[ProjectId] = e.[QBClassID]
            AND ai.[IsDeleted] = 0
        ) AS totalCostChanges,
        (
          SELECT COUNT(*)
          FROM dbo.[ActionItemCostChange] aicc
          INNER JOIN dbo.[ActionItems] ai ON aicc.[ActionItemId] = ai.[Id]
          WHERE ai.[ProjectId] = e.[QBClassID]
            AND ai.[IsDeleted] = 0
        ) AS revisionCount
      FROM dbo.[Estimates] e
      LEFT JOIN dbo.[QBClasses] qbc ON e.[QBClassID] = qbc.[ID]
      ${whereClause}
      GROUP BY e.[QBClassID], qbc.[Name]
      ORDER BY totalCostChanges DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT e.[QBClassID]) AS total
      FROM dbo.[Estimates] e
      ${whereClause}
    `;

    const dataResult = await executeQuery(dataQuery, params);
    const countResult = await executeQuery(countQuery, params);

    // Calculate final estimates and overages
    const revisions = dataResult.recordset.map(row => {
      const originalEstimate = row.originalEstimate || 0;
      const totalCostChanges = row.totalCostChanges || 0;
      const finalEstimate = originalEstimate + totalCostChanges;
      const overage = totalCostChanges;
      const overagePercent = originalEstimate > 0 ? (overage / originalEstimate) * 100 : 0;

      return {
        projectId: row.projectId,
        projectName: row.projectName || 'Unknown Project',
        originalEstimate: parseFloat(originalEstimate.toFixed(2)),
        finalEstimate: parseFloat(finalEstimate.toFixed(2)),
        overage: parseFloat(overage.toFixed(2)),
        overagePercent: parseFloat(overagePercent.toFixed(2)),
        revisionCount: row.revisionCount || 0
      };
    });

    // Calculate average overage
    const totalRevisions = revisions.length;
    const totalOverage = revisions.reduce((sum, r) => sum + r.overage, 0);
    const totalOriginal = revisions.reduce((sum, r) => sum + r.originalEstimate, 0);
    const averageOveragePercent = totalOriginal > 0
      ? parseFloat(((totalOverage / totalOriginal) * 100).toFixed(2))
      : 0;

    const result = {
      averageOveragePercent,
      totalRevisions,
      revisions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.recordset[0].total
      }
    };

    return response.success(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEstimateRevisionHistory
};
