const sql = require('mssql');

const config = {
  server: 'contractorsdesk.database.windows.net',
  database: 'chaconstruction-test',
  user: 'contractorsdeskadmin',
  password: 'contractorsdesk@123',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function checkSchema() {
  try {
    await sql.connect(config);

    console.log('=== QBTransactions Sample ===');
    const qbSample = await sql.query`SELECT TOP 2 * FROM QBTransactions ORDER BY TransactionDate DESC`;
    console.log(JSON.stringify(qbSample.recordset, null, 2));

    console.log('\n=== JobBalances Sample ===');
    const jbSample = await sql.query`SELECT TOP 2 * FROM JobBalances`;
    console.log(JSON.stringify(jbSample.recordset, null, 2));

    console.log('\n=== JobBalances with QBClasses JOIN ===');
    const jbJoin = await sql.query`
      SELECT TOP 2 
        jb.Id,
        jb.JobId,
        jb.Balance,
        jb.DateUpdated,
        qbc.FullName as ProjectName
      FROM JobBalances jb
      LEFT JOIN QBClasses qbc ON jb.JobId = qbc.ListID
    `;
    console.log(JSON.stringify(jbJoin.recordset, null, 2));

    console.log('\n=== ProposalTemplates with LineItems ===');
    const ptSample = await sql.query`
      SELECT TOP 1 
        pt.Id,
        pt.Name,
        pt.IsDefault,
        (SELECT COUNT(*) FROM ProposalTemplatesLineItems WHERE ProposalTemplateId = pt.Id) as LineItemCount
      FROM ProposalTemplates pt
      WHERE pt.IsActive = 1
    `;
    console.log(JSON.stringify(ptSample.recordset, null, 2));

    console.log('\n=== QBTransactions with ClassID lookup ===');
    const qbClass = await sql.query`
      SELECT TOP 3
        qbt.ID,
        qbt.TxnType,
        qbt.Amount,
        qbt.TransactionDate,
        qbt.ClassID,
        qbc.FullName as ProjectName,
        qbt.Memo
      FROM QBTransactions qbt
      LEFT JOIN QBClasses qbc ON qbt.ClassID = qbc.ListID
      WHERE qbt.ClassID IS NOT NULL
      ORDER BY qbt.TransactionDate DESC
    `;
    console.log(JSON.stringify(qbClass.recordset, null, 2));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.close();
  }
}

checkSchema();
