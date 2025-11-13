const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/proposal-templates/pricing
 * Get standard pricing from proposal templates
 */
const getProposalTemplatePricing = async (req, res, next) => {
  try {
    const { templateId, category, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = { offset: parseInt(offset), limit: parseInt(limit) };

    if (templateId) {
      conditions.push('pt.[Id] = @templateId');
      params.templateId = templateId;
    }

    if (category) {
      conditions.push('(pt.[Name] LIKE @category OR ec.[Name] LIKE @category)');
      params.category = `%${category}%`;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get templates with their line items
    const dataQuery = `
      SELECT
        pt.[Id] AS templateId,
        pt.[Name] AS templateName,
        ptli.[Id] AS itemId,
        ptli.[Name] AS itemName,
        ptli.[Description] AS itemDescription,
        ptli.[Amount],
        ptli.[Percentage],
        ptli.[Sequence],
        ec.[Name] AS categoryName,
        ec.[ID] AS categoryId
      FROM dbo.[ProposalTemplates] pt
      LEFT JOIN dbo.[ProposalTemplatesLineItems] ptli ON pt.[Id] = ptli.[ProposalTemplateId]
      LEFT JOIN dbo.[EstimateCategories] ec ON ptli.[EstimateCategoryId] = ec.[ID]
      ${whereClause}
      ORDER BY pt.[Name], ptli.[Sequence], ptli.[Id]
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT pt.[Id]) AS total
      FROM dbo.[ProposalTemplates] pt
      LEFT JOIN dbo.[ProposalTemplatesLineItems] ptli ON pt.[Id] = ptli.[ProposalTemplateId]
      LEFT JOIN dbo.[EstimateCategories] ec ON ptli.[EstimateCategoryId] = ec.[ID]
      ${whereClause}
    `;

    const dataResult = await executeQuery(dataQuery, params);
    const countResult = await executeQuery(countQuery, params);

    // Group items by template
    const templatesMap = {};

    dataResult.recordset.forEach(row => {
      const templateId = row.templateId;

      if (!templatesMap[templateId]) {
        templatesMap[templateId] = {
          templateId,
          templateName: row.templateName,
          templateDescription: row.templateDescription,
          items: []
        };
      }

      if (row.itemId) {
        // Determine unit type based on available fields
        let unit = 'unit';
        if (row.Percentage && row.Percentage > 0) unit = '%';

        templatesMap[templateId].items.push({
          itemId: row.itemId,
          name: row.itemName,
          description: row.itemDescription,
          amount: parseFloat((row.Amount || 0).toFixed(2)),
          percentage: row.Percentage || 0,
          unit,
          category: row.categoryName || 'Uncategorized',
          categoryId: row.categoryId,
          sequence: row.Sequence
        });
      }
    });

    const templates = Object.values(templatesMap);

    return response.paginated(res, templates, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/proposal-templates/:id/pricing
 * Get pricing for a specific template
 */
const getProposalTemplatePricingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get template info
    const templateQuery = `
      SELECT * FROM dbo.[ProposalTemplates]
      WHERE [Id] = @id
    `;
    const templateResult = await executeQuery(templateQuery, { id });

    if (templateResult.recordset.length === 0) {
      return response.error(res, 'Proposal template not found', 404);
    }

    // Get template line items with categories
    const itemsQuery = `
      SELECT
        ptli.[Id] AS itemId,
        ptli.[Name] AS itemName,
        ptli.[Description] AS itemDescription,
        ptli.[Amount],
        ptli.[Percentage],
        ptli.[Sequence],
        ptli.[ParentId],
        ec.[Name] AS categoryName,
        ec.[ID] AS categoryId
      FROM dbo.[ProposalTemplatesLineItems] ptli
      LEFT JOIN dbo.[EstimateCategories] ec ON ptli.[EstimateCategoryId] = ec.[ID]
      WHERE ptli.[ProposalTemplateId] = @id AND ptli.[IsDeleted] = 0
      ORDER BY ptli.[Sequence], ptli.[Id]
    `;
    const itemsResult = await executeQuery(itemsQuery, { id });

    const template = templateResult.recordset[0];
    template.items = itemsResult.recordset.map(row => {
      let unit = 'unit';
      if (row.Percentage && row.Percentage > 0) unit = '%';

      return {
        itemId: row.itemId,
        name: row.itemName,
        description: row.itemDescription,
        amount: parseFloat((row.Amount || 0).toFixed(2)),
        percentage: row.Percentage || 0,
        unit,
        sequence: row.Sequence,
        parentId: row.ParentId,
        category: row.categoryName || 'Uncategorized',
        categoryId: row.categoryId
      };
    });

    // Calculate total
    const total = template.items.reduce((sum, item) => sum + item.amount, 0);
    template.totalAmount = parseFloat(total.toFixed(2));

    return response.success(res, template);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProposalTemplatePricing,
  getProposalTemplatePricingById
};
