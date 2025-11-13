const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/cost-revisions
 * Get cost revision history per project
 */
const getCostRevisions = async (req, res, next) => {
  try {
    const { projectId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = { offset: parseInt(offset), limit: parseInt(limit) };

    if (projectId) {
      conditions.push('cr.[ProjectId] = @projectId');
      params.projectId = projectId;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) AS total FROM dbo.[CostRevisions] cr ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);

    // Get cost revisions with items
    const dataQuery = `
      SELECT
        cr.*,
        qbc.[Name] AS projectName,
        qbc.[FullyQualifiedName] AS projectFullName,
        (SELECT COUNT(*) FROM dbo.[CostRevisionItems] WHERE [CostRevisionId] = cr.[Id]) AS itemCount
      FROM dbo.[CostRevisions] cr
      LEFT JOIN dbo.[QBClasses] qbc ON cr.[ProjectId] = qbc.[ID]
      ${whereClause}
      ORDER BY cr.[RevisionDate] DESC, cr.[RevisionNumber] DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const dataResult = await executeQuery(dataQuery, params);

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/cost-revisions/:id
 * Get cost revision by ID with items
 */
const getCostRevisionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get revision header
    const revisionQuery = `
      SELECT
        cr.*,
        qbc.[Name] AS projectName,
        qbc.[FullyQualifiedName] AS projectFullName
      FROM dbo.[CostRevisions] cr
      LEFT JOIN dbo.[QBClasses] qbc ON cr.[ProjectId] = qbc.[ID]
      WHERE cr.[Id] = @id
    `;
    const revisionResult = await executeQuery(revisionQuery, { id });

    if (revisionResult.recordset.length === 0) {
      return response.error(res, 'Cost revision not found', 404);
    }

    // Get revision items
    const itemsQuery = `
      SELECT
        cri.*,
        ec.[Name] AS categoryName
      FROM dbo.[CostRevisionItems] cri
      LEFT JOIN dbo.[EstimateCategories] ec ON cri.[EstimateCategoryId] = ec.[ID]
      WHERE cri.[CostRevisionId] = @id
      ORDER BY cri.[Id]
    `;
    const itemsResult = await executeQuery(itemsQuery, { id });

    const revision = revisionResult.recordset[0];
    revision.items = itemsResult.recordset.map(item => ({
      itemId: item.Id,
      category: item.categoryName || 'Uncategorized',
      categoryId: item.EstimateCategoryId,
      originalAmount: parseFloat((item.OriginalAmount || 0).toFixed(2)),
      revisedAmount: parseFloat((item.RevisedAmount || 0).toFixed(2)),
      variance: parseFloat(((item.RevisedAmount || 0) - (item.OriginalAmount || 0)).toFixed(2))
    }));

    // Calculate total change
    const totalChange = revision.items.reduce((sum, item) => sum + item.variance, 0);
    revision.totalChange = parseFloat(totalChange.toFixed(2));

    return response.success(res, revision);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCostRevisions,
  getCostRevisionById
};
