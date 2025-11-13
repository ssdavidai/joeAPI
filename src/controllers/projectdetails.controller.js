const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/projects/:id/details
 * Get comprehensive project details with related data
 */
const getProjectDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get project basic info from QBClasses
    const projectQuery = `
      SELECT
        [ID] AS projectId,
        [Name] AS projectName,
        [FullyQualifiedName] AS projectFullName,
        [Active] AS isActive,
        [TimeCreated],
        [TimeModified]
      FROM dbo.[QBClasses]
      WHERE [ID] = @id
    `;
    const projectResult = await executeQuery(projectQuery, { id });

    if (projectResult.recordset.length === 0) {
      return response.error(res, 'Project not found', 404);
    }

    const project = projectResult.recordset[0];

    // Get client info from Proposals
    const clientQuery = `
      SELECT TOP 1
        c.[Id] AS clientId,
        c.[Name] AS clientName,
        c.[EmailAddress],
        c.[Phone]
      FROM dbo.[Proposals] p
      INNER JOIN dbo.[Clients] c ON p.[ClientId] = c.[Id]
      WHERE p.[QBClassId] = @id
      ORDER BY p.[DateCreated] DESC
    `;
    const clientResult = await executeQuery(clientQuery, { id });
    project.client = clientResult.recordset[0] || null;

    // Get project schedule status
    const scheduleQuery = `
      SELECT
        ps.[Id] AS scheduleId,
        ps.[StartDate],
        ps.[Status],
        (SELECT COUNT(*) FROM dbo.[ProjectScheduleTasks] WHERE [ProjectScheduleId] = ps.[Id]) AS totalTasks,
        (SELECT COUNT(*) FROM dbo.[ProjectScheduleTasks] WHERE [ProjectScheduleId] = ps.[Id] AND [EndDate] < GETDATE()) AS completedTasks
      FROM dbo.[ProjectSchedules] ps
      WHERE ps.[ProjectId] = @id
      ORDER BY ps.[DateCreated] DESC
    `;
    const scheduleResult = await executeQuery(scheduleQuery, { id });

    if (scheduleResult.recordset.length > 0) {
      const schedule = scheduleResult.recordset[0];
      project.scheduleStatus = {
        totalTasks: schedule.totalTasks || 0,
        completedTasks: schedule.completedTasks || 0,
        progressPercent: schedule.totalTasks > 0 ? ((schedule.completedTasks / schedule.totalTasks) * 100).toFixed(2) : 0,
        startDate: schedule.StartDate,
        status: schedule.Status
      };
    } else {
      project.scheduleStatus = null;
    }

    // Get financial summary from estimates and actual costs
    const estimateQuery = `
      SELECT SUM([Amount]) AS estimatedValue
      FROM dbo.[Estimates]
      WHERE [QBClassID] = @id
    `;
    const estimateResult = await executeQuery(estimateQuery, { id });

    const actualCostQuery = `
      SELECT SUM(CASE WHEN [Amount] < 0 THEN ABS([Amount]) ELSE 0 END) AS actualCost
      FROM dbo.[QBTransactions]
      WHERE [QBClassId] = @id
        AND [TxnType] IN ('Bill', 'Check', 'CreditCardCharge')
    `;
    const actualCostResult = await executeQuery(actualCostQuery, { id });

    const estimatedValue = estimateResult.recordset[0]?.estimatedValue || 0;
    const actualCost = actualCostResult.recordset[0]?.actualCost || 0;
    const remaining = estimatedValue - actualCost;

    project.financialStatus = {
      budgeted: parseFloat(estimatedValue.toFixed(2)),
      spent: parseFloat(actualCost.toFixed(2)),
      remaining: parseFloat(remaining.toFixed(2)),
      percentSpent: estimatedValue > 0 ? parseFloat(((actualCost / estimatedValue) * 100).toFixed(2)) : 0
    };

    // Get supervisors
    const supervisorsQuery = `
      SELECT
        ps.[SupervisorId],
        u.[FirstName],
        u.[LastName],
        u.[Email],
        ps.[DateAssigned]
      FROM dbo.[ProjectSupervisors] ps
      LEFT JOIN dbo.[Users] u ON ps.[SupervisorId] = u.[Id]
      WHERE ps.[ProjectId] = @id
    `;
    const supervisorsResult = await executeQuery(supervisorsQuery, { id });
    project.supervisors = supervisorsResult.recordset;

    // Get recent action items
    const actionItemsQuery = `
      SELECT TOP 10
        [Id],
        [Title],
        [Description],
        [Status],
        [DueDate],
        [ActionTypeId],
        [DateCreated]
      FROM dbo.[ActionItems]
      WHERE [ProjectId] = @id
        AND [IsDeleted] = 0
      ORDER BY [DateCreated] DESC
    `;
    const actionItemsResult = await executeQuery(actionItemsQuery, { id });
    project.recentActionItems = actionItemsResult.recordset;

    return response.success(res, project);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectDetails
};
