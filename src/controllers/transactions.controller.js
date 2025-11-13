const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/transactions
 * Retrieve QuickBooks transactions with filtering
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const {
      projectId,
      accountId,
      startDate,
      endDate,
      transactionType,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE clause dynamically
    const conditions = [];
    const params = { offset: parseInt(offset), limit: parseInt(limit) };

    if (projectId) {
      conditions.push('qbt.[ClassID] = @projectId');
      params.projectId = projectId;
    }

    if (accountId) {
      conditions.push('qbt.[AccountID] = @accountId');
      params.accountId = accountId;
    }

    if (startDate) {
      conditions.push('qbt.[TransactionDate] >= @startDate');
      params.startDate = startDate;
    }

    if (endDate) {
      conditions.push('qbt.[TransactionDate] <= @endDate');
      params.endDate = endDate;
    }

    if (transactionType) {
      conditions.push('qbt.[TxnType] = @transactionType');
      params.transactionType = transactionType;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) AS total FROM dbo.[QBTransactions] qbt ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);

    // Get paginated data with project name from QBClasses
    const dataQuery = `
      SELECT
        qbt.*,
        qbc.[FullyQualifiedName] as projectName
      FROM dbo.[QBTransactions] qbt
      LEFT JOIN dbo.[QBClasses] qbc ON qbt.[ClassID] = qbc.[ID]
      ${whereClause}
      ORDER BY qbt.[TransactionDate] DESC, qbt.[Created] DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const dataResult = await executeQuery(dataQuery, params);

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/transactions/summary
 * Get transaction summary/totals by project or account
 */
const getTransactionSummary = async (req, res, next) => {
  try {
    const {
      projectId,
      accountId,
      groupBy = 'project',
      startDate,
      endDate
    } = req.query;

    // Build WHERE clause
    const conditions = [];
    const params = {};

    if (projectId) {
      conditions.push('qbt.[ClassID] = @projectId');
      params.projectId = projectId;
    }

    if (accountId) {
      conditions.push('qbt.[AccountID] = @accountId');
      params.accountId = accountId;
    }

    if (startDate) {
      conditions.push('qbt.[TransactionDate] >= @startDate');
      params.startDate = startDate;
    }

    if (endDate) {
      conditions.push('qbt.[TransactionDate] <= @endDate');
      params.endDate = endDate;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Determine GROUP BY columns
    let groupByColumn, groupIdColumn, groupNameColumn, fromClause;
    switch (groupBy.toLowerCase()) {
      case 'account':
        groupByColumn = 'qbt.[AccountID]';
        groupIdColumn = 'qbt.[AccountID]';
        groupNameColumn = 'qba.[Name]';
        fromClause = 'dbo.[QBTransactions] qbt LEFT JOIN dbo.[QBAccounts] qba ON qbt.[AccountID] = qba.[ListID]';
        break;
      case 'vendor':
        groupByColumn = 'qbt.[VendorID]';
        groupIdColumn = 'qbt.[VendorID]';
        groupNameColumn = 'qbv.[Name]';
        fromClause = 'dbo.[QBTransactions] qbt LEFT JOIN dbo.[QBVendors] qbv ON qbt.[VendorID] = qbv.[ListID]';
        break;
      case 'month':
        groupByColumn = 'FORMAT(qbt.[TransactionDate], \'yyyy-MM\')';
        groupIdColumn = 'FORMAT(qbt.[TransactionDate], \'yyyy-MM\')';
        groupNameColumn = 'FORMAT(qbt.[TransactionDate], \'yyyy-MM\')';
        fromClause = 'dbo.[QBTransactions] qbt';
        break;
      default: // project
        groupByColumn = 'qbt.[ClassID]';
        groupIdColumn = 'qbt.[ClassID]';
        groupNameColumn = 'qbc.[FullyQualifiedName]';
        fromClause = 'dbo.[QBTransactions] qbt LEFT JOIN dbo.[QBClasses] qbc ON qbt.[ClassID] = qbc.[ID]';
    }

    const summaryQuery = `
      SELECT
        ${groupIdColumn} AS groupId,
        ${groupNameColumn} AS groupName,
        SUM(CASE WHEN qbt.[Amount] > 0 THEN qbt.[Amount] ELSE 0 END) AS totalDebits,
        SUM(CASE WHEN qbt.[Amount] < 0 THEN ABS(qbt.[Amount]) ELSE 0 END) AS totalCredits,
        SUM(qbt.[Amount]) AS netAmount,
        COUNT(*) AS transactionCount
      FROM ${fromClause}
      ${whereClause}
      GROUP BY ${groupByColumn}${groupBy.toLowerCase() !== 'month' ? ', ' + groupNameColumn : ''}
      ORDER BY netAmount DESC
    `;

    const result = await executeQuery(summaryQuery, params);

    return response.success(res, {
      summary: result.recordset,
      groupBy: groupBy,
      filters: { projectId, accountId, startDate, endDate }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTransactions,
  getTransactionSummary
};
