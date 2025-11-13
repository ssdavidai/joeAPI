const { executeQuery } = require('../config/database');
const response = require('../utils/response');

/**
 * GET /api/v1/invoices
 * List invoices with payment status and filtering
 */
const getAllInvoices = async (req, res, next) => {
  try {
    const {
      clientId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions = [];
    const params = { offset: parseInt(offset), limit: parseInt(limit) };

    if (clientId) {
      conditions.push('i.[ClientId] = @clientId');
      params.clientId = clientId;
    }

    if (status) {
      conditions.push('i.[Status] = @status');
      params.status = status;
    }

    if (startDate) {
      conditions.push('i.[InvoiceDate] >= @startDate');
      params.startDate = startDate;
    }

    if (endDate) {
      conditions.push('i.[InvoiceDate] <= @endDate');
      params.endDate = endDate;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) AS total FROM dbo.[Invoices] i ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);

    // Get invoices with client info and line items
    const dataQuery = `
      SELECT
        i.*,
        qbc.[Name] AS clientName,
        qbc.[FullyQualifiedName] AS clientFullName,
        (SELECT COUNT(*) FROM dbo.[InvoiceItems] WHERE [InvoiceId] = i.[Id]) AS itemCount
      FROM dbo.[Invoices] i
      LEFT JOIN dbo.[QBClasses] qbc ON i.[ClientId] = qbc.[ID]
      ${whereClause}
      ORDER BY i.[InvoiceDate] DESC, i.[InvoiceNumber] DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const dataResult = await executeQuery(dataQuery, params);

    return response.paginated(res, dataResult.recordset, page, limit, countResult.recordset[0].total);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/invoices/:id
 * Get invoice by ID with line items
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get invoice with client info
    const invoiceQuery = `
      SELECT
        i.*,
        qbc.[Name] AS clientName,
        qbc.[FullyQualifiedName] AS clientFullName
      FROM dbo.[Invoices] i
      LEFT JOIN dbo.[QBClasses] qbc ON i.[ClientId] = qbc.[ID]
      WHERE i.[Id] = @id
    `;
    const invoiceResult = await executeQuery(invoiceQuery, { id });

    if (invoiceResult.recordset.length === 0) {
      return response.error(res, 'Invoice not found', 404);
    }

    // Get invoice items
    const itemsQuery = `
      SELECT * FROM dbo.[InvoiceItems]
      WHERE [InvoiceId] = @id
      ORDER BY [Sequence], [Id]
    `;
    const itemsResult = await executeQuery(itemsQuery, { id });

    const invoice = invoiceResult.recordset[0];
    invoice.items = itemsResult.recordset;

    return response.success(res, invoice);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById
};
