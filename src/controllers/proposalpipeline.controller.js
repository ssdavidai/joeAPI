const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/proposals/pipeline
 * Get proposal pipeline analytics
 */
const getProposalPipeline = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;

    const conditions = [];
    const params = {};

    if (status) {
      conditions.push('[DocStatus] = @status');
      params.status = status;
    }

    if (startDate) {
      conditions.push('[Date] >= @startDate');
      params.startDate = startDate;
    }

    if (endDate) {
      conditions.push('[Date] <= @endDate');
      params.endDate = endDate;
    }

    // Add IsDeleted and IsArchived filters
    conditions.push('[IsDeleted] = 0');

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get overall summary
    const summaryQuery = `
      SELECT
        COUNT(*) AS totalProposals,
        SUM(CASE WHEN [DocStatus] = 'Pending' OR [DocStatus] = 'Sent' THEN 1 ELSE 0 END) AS pendingCount,
        SUM(CASE WHEN [DocStatus] = 'Pending' OR [DocStatus] = 'Sent' THEN [TotalAmount] ELSE 0 END) AS pendingValue,
        SUM(CASE WHEN [DocStatus] = 'Accepted' OR [DocStatus] = 'Approved' THEN 1 ELSE 0 END) AS acceptedCount,
        SUM(CASE WHEN [DocStatus] = 'Accepted' OR [DocStatus] = 'Approved' THEN [TotalAmount] ELSE 0 END) AS acceptedValue,
        SUM(CASE WHEN [DocStatus] = 'Declined' OR [DocStatus] = 'Rejected' THEN 1 ELSE 0 END) AS declinedCount,
        SUM(CASE WHEN [DocStatus] = 'Declined' OR [DocStatus] = 'Rejected' THEN [TotalAmount] ELSE 0 END) AS declinedValue
      FROM dbo.[Proposals]
      ${whereClause}
    `;
    const summaryResult = await executeQuery(summaryQuery, params);
    const summary = summaryResult.recordset[0];

    // Calculate conversion rate
    const totalDecided = (summary.acceptedCount || 0) + (summary.declinedCount || 0);
    const conversionRate = totalDecided > 0
      ? parseFloat(((summary.acceptedCount / totalDecided) * 100).toFixed(2))
      : 0;

    // Get breakdown by status
    const byStatusQuery = `
      SELECT
        [DocStatus] AS status,
        COUNT(*) AS count,
        SUM([TotalAmount]) AS totalValue,
        AVG([TotalAmount]) AS avgValue
      FROM dbo.[Proposals]
      ${whereClause}
      GROUP BY [DocStatus]
      ORDER BY totalValue DESC
    `;
    const byStatusResult = await executeQuery(byStatusQuery, params);

    // Get recent proposals
    const recentQuery = `
      SELECT TOP 20
        p.[ID],
        p.[Number],
        p.[Date],
        p.[TotalAmount],
        p.[DocStatus],
        c.[Name] AS clientName,
        qbc.[Name] AS projectName
      FROM dbo.[Proposals] p
      LEFT JOIN dbo.[Clients] c ON p.[ClientId] = c.[Id]
      LEFT JOIN dbo.[QBClasses] qbc ON p.[QBClassId] = qbc.[ID]
      ${whereClause}
      ORDER BY p.[Date] DESC
    `;
    const recentResult = await executeQuery(recentQuery, params);

    const result = {
      summary: {
        totalProposals: summary.totalProposals || 0,
        pendingCount: summary.pendingCount || 0,
        pendingValue: parseFloat((summary.pendingValue || 0).toFixed(2)),
        acceptedCount: summary.acceptedCount || 0,
        acceptedValue: parseFloat((summary.acceptedValue || 0).toFixed(2)),
        declinedCount: summary.declinedCount || 0,
        declinedValue: parseFloat((summary.declinedValue || 0).toFixed(2)),
        conversionRate
      },
      byStatus: byStatusResult.recordset.map(row => ({
        status: row.status,
        count: row.count,
        totalValue: parseFloat((row.totalValue || 0).toFixed(2)),
        avgValue: parseFloat((row.avgValue || 0).toFixed(2))
      })),
      recentProposals: recentResult.recordset,
      filters: { status, startDate, endDate }
    };

    return response.success(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProposalPipeline
};
