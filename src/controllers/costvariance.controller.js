const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/cost-variance
 * Calculate cost variance (actual vs. estimate) for a project
 */
const getCostVariance = async (req, res, next) => {
  try {
    const { projectId, categoryId } = req.query;

    if (!projectId) {
      return response.error(res, 'projectId is required', 400);
    }

    // Get project name
    const projectQuery = `SELECT [Name], [FullyQualifiedName] FROM dbo.[QBClasses] WHERE [ID] = @projectId`;
    const projectResult = await executeQuery(projectQuery, { projectId });

    if (projectResult.recordset.length === 0) {
      return response.error(res, 'Project not found', 404);
    }

    const projectName = projectResult.recordset[0].Name;

    // Get original estimates by category
    const estimateQuery = `
      SELECT
        e.[ID] AS estimateId,
        e.[Amount] AS estimatedAmount,
        ec.[ID] AS categoryId,
        ec.[Name] AS categoryName,
        ec.[ParentEstimateCategoryID] AS parentCategoryId
      FROM dbo.[Estimates] e
      LEFT JOIN dbo.[EstimateCategories] ec ON e.[EstimateSubCategoryID] = ec.[ID]
      WHERE e.[QBClassID] = @projectId
      ${categoryId ? 'AND ec.[ID] = @categoryId' : ''}
    `;
    const estimateParams = { projectId };
    if (categoryId) estimateParams.categoryId = categoryId;

    const estimateResult = await executeQuery(estimateQuery, estimateParams);

    // Get cost changes from action items
    const costChangesQuery = `
      SELECT
        aicc.[Amount],
        aicc.[EstimateCategoryId],
        ec.[Name] AS categoryName,
        ai.[DateCreated]
      FROM dbo.[ActionItemCostChange] aicc
      INNER JOIN dbo.[ActionItems] ai ON aicc.[ActionItemId] = ai.[Id]
      LEFT JOIN dbo.[EstimateCategories] ec ON aicc.[EstimateCategoryId] = ec.[ID]
      WHERE ai.[ProjectId] = @projectId
        AND ai.[IsDeleted] = 0
      ${categoryId ? 'AND aicc.[EstimateCategoryId] = @categoryId' : ''}
    `;
    const costChangesResult = await executeQuery(costChangesQuery, estimateParams);

    // Get actual costs from QBTransactions
    const actualCostsQuery = `
      SELECT
        SUM(CASE WHEN [Amount] < 0 THEN ABS([Amount]) ELSE 0 END) AS totalActualCost,
        [AccountId],
        [AccountName]
      FROM dbo.[QBTransactions]
      WHERE [QBClassId] = @projectId
        AND [TxnType] IN ('Bill', 'Check', 'CreditCardCharge', 'JournalEntry')
      GROUP BY [AccountId], [AccountName]
    `;
    const actualCostsResult = await executeQuery(actualCostsQuery, { projectId });

    // Calculate totals
    const originalEstimate = estimateResult.recordset.reduce((sum, row) => sum + (row.estimatedAmount || 0), 0);
    const totalCostChanges = costChangesResult.recordset.reduce((sum, row) => sum + (row.Amount || 0), 0);
    const revisedEstimate = originalEstimate + totalCostChanges;
    const actualCost = actualCostsResult.recordset.reduce((sum, row) => sum + (row.totalActualCost || 0), 0);
    const variance = actualCost - revisedEstimate;
    const variancePercent = revisedEstimate !== 0 ? (variance / revisedEstimate) * 100 : 0;

    // Build category breakdown
    const categories = {};

    // Add estimates
    estimateResult.recordset.forEach(row => {
      const catId = row.categoryId || 'uncategorized';
      if (!categories[catId]) {
        categories[catId] = {
          categoryId: catId,
          categoryName: row.categoryName || 'Uncategorized',
          estimated: 0,
          costChanges: 0,
          revised: 0,
          actual: 0,
          variance: 0,
          variancePercent: 0
        };
      }
      categories[catId].estimated += row.estimatedAmount || 0;
    });

    // Add cost changes
    costChangesResult.recordset.forEach(row => {
      const catId = row.EstimateCategoryId || 'uncategorized';
      if (!categories[catId]) {
        categories[catId] = {
          categoryId: catId,
          categoryName: row.categoryName || 'Uncategorized',
          estimated: 0,
          costChanges: 0,
          revised: 0,
          actual: 0,
          variance: 0,
          variancePercent: 0
        };
      }
      categories[catId].costChanges += row.Amount || 0;
    });

    // Calculate revised amounts and variance for each category
    Object.keys(categories).forEach(catId => {
      const cat = categories[catId];
      cat.revised = cat.estimated + cat.costChanges;
      // Note: Actual costs by category would require mapping QBTransactions to EstimateCategories
      // For now, we'll leave actual at 0 unless we have that mapping
      cat.variance = cat.actual - cat.revised;
      cat.variancePercent = cat.revised !== 0 ? (cat.variance / cat.revised) * 100 : 0;
    });

    const result = {
      projectId,
      projectName,
      originalEstimate: parseFloat(originalEstimate.toFixed(2)),
      revisedEstimate: parseFloat(revisedEstimate.toFixed(2)),
      actualCost: parseFloat(actualCost.toFixed(2)),
      variance: parseFloat(variance.toFixed(2)),
      variancePercent: parseFloat(variancePercent.toFixed(2)),
      categories: Object.values(categories).map(cat => ({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        estimated: parseFloat(cat.estimated.toFixed(2)),
        revised: parseFloat(cat.revised.toFixed(2)),
        actual: parseFloat(cat.actual.toFixed(2)),
        variance: parseFloat(cat.variance.toFixed(2)),
        variancePercent: parseFloat(cat.variancePercent.toFixed(2))
      }))
    };

    return response.success(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCostVariance
};
