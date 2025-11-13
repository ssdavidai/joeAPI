const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/deposits
 * Track deposits and retainers with usage
 */
const getDeposits = async (req, res, next) => {
  try {
    const { projectId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = { offset: parseInt(offset), limit: parseInt(limit) };

    if (projectId) {
      conditions.push('qbc.[ID] = @projectId');
      params.projectId = projectId;
    }

    // Filter to active projects only
    conditions.push('qbc.[IsActive] = 1');

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get projects with deposit/retainer information
    // Using QBTransactions to calculate deposits received and amount used
    const dataQuery = `
      SELECT
        qbc.[ListID] AS projectId,
        qbc.[Name] AS projectName,
        qbc.[FullyQualifiedName] AS projectFullName,
        ISNULL((
          SELECT SUM([Amount])
          FROM dbo.[QBTransactions]
          WHERE [ClassID] = qbc.[ID]
            AND [TxnType] IN ('SalesReceipt', 'ReceivePayment', 'Deposit')
            AND [Amount] > 0
            AND ([Memo] LIKE '%deposit%' OR [Memo] LIKE '%retainer%')
        ), 0) AS initialDeposit,
        ISNULL((
          SELECT SUM(ABS([Amount]))
          FROM dbo.[QBTransactions]
          WHERE [ClassID] = qbc.[ID]
            AND [TxnType] IN ('Bill', 'Check', 'CreditCardCharge')
            AND [Amount] < 0
        ), 0) AS totalWithdrawn,
        0 AS thresholdReached
      FROM dbo.[QBClasses] qbc
      ${whereClause}
      ORDER BY qbc.[Name]
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM dbo.[QBClasses] qbc
      ${whereClause}
    `;

    const dataResult = await executeQuery(dataQuery, params);
    const countResult = await executeQuery(countQuery, params);

    // Calculate current balance and percent used
    const deposits = dataResult.recordset.map(row => {
      const initialDeposit = row.initialDeposit || 0;
      const totalWithdrawn = row.totalWithdrawn || 0;
      const currentBalance = initialDeposit - totalWithdrawn;
      const percentUsed = initialDeposit > 0 ? (totalWithdrawn / initialDeposit) * 100 : 0;
      const thresholdReached = percentUsed >= 80; // 80% threshold

      return {
        projectId: row.projectId,
        projectName: row.projectName,
        projectFullName: row.projectFullName,
        initialDeposit: parseFloat(initialDeposit.toFixed(2)),
        totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
        currentBalance: parseFloat(currentBalance.toFixed(2)),
        percentUsed: parseFloat(percentUsed.toFixed(2)),
        thresholdReached
      };
    }).filter(d => d.initialDeposit > 0); // Only include projects with deposits

    return response.paginated(res, deposits, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/deposits/:projectId
 * Get deposit information for a specific project
 */
const getDepositByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Get project name
    const projectQuery = `SELECT [Name], [FullyQualifiedName] FROM dbo.[QBClasses] WHERE [ID] = @projectId`;
    const projectResult = await executeQuery(projectQuery, { projectId });

    if (projectResult.recordset.length === 0) {
      return response.error(res, 'Project not found', 404);
    }

    // Get deposit transactions
    const depositQuery = `
      SELECT SUM([Amount]) AS initialDeposit
      FROM dbo.[QBTransactions]
      WHERE [ClassID] = @projectId
        AND [TxnType] IN ('SalesReceipt', 'ReceivePayment', 'Deposit')
        AND [Amount] > 0
        AND ([Memo] LIKE '%deposit%' OR [Memo] LIKE '%retainer%')
    `;
    const depositResult = await executeQuery(depositQuery, { projectId });

    // Get withdrawn amounts
    const withdrawnQuery = `
      SELECT SUM(ABS([Amount])) AS totalWithdrawn
      FROM dbo.[QBTransactions]
      WHERE [ClassID] = @projectId
        AND [TxnType] IN ('Bill', 'Check', 'CreditCardCharge')
        AND [Amount] < 0
    `;
    const withdrawnResult = await executeQuery(withdrawnQuery, { projectId });

    // Get detailed transaction history
    const historyQuery = `
      SELECT TOP 20
        [TransactionDate],
        [TxnType],
        [Amount],
        [Memo],
        [Name] as VendorName
      FROM dbo.[QBTransactions]
      WHERE [ClassID] = @projectId
        AND (
          ([TxnType] IN ('SalesReceipt', 'ReceivePayment', 'Deposit') AND [Amount] > 0)
          OR ([TxnType] IN ('Bill', 'Check', 'CreditCardCharge') AND [Amount] < 0)
        )
      ORDER BY [TransactionDate] DESC
    `;
    const historyResult = await executeQuery(historyQuery, { projectId });

    const project = projectResult.recordset[0];
    const initialDeposit = depositResult.recordset[0]?.initialDeposit || 0;
    const totalWithdrawn = withdrawnResult.recordset[0]?.totalWithdrawn || 0;
    const currentBalance = initialDeposit - totalWithdrawn;
    const percentUsed = initialDeposit > 0 ? (totalWithdrawn / initialDeposit) * 100 : 0;
    const thresholdReached = percentUsed >= 80;

    const result = {
      projectId,
      projectName: project.Name,
      projectFullName: project.FullyQualifiedName,
      initialDeposit: parseFloat(initialDeposit.toFixed(2)),
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      currentBalance: parseFloat(currentBalance.toFixed(2)),
      percentUsed: parseFloat(percentUsed.toFixed(2)),
      thresholdReached,
      transactions: historyResult.recordset
    };

    return response.success(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeposits,
  getDepositByProject
};
