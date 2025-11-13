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

async function test() {
  try {
    await sql.connect(config);

    console.log('=== Testing transactions query ===');
    const result = await sql.query`
      SELECT TOP 2
        qbt.*,
        qbc.[FullyQualifiedName] as projectName
      FROM dbo.[QBTransactions] qbt
      LEFT JOIN dbo.[QBClasses] qbc ON qbt.[ClassID] = qbc.[ListID]
      ORDER BY qbt.[TransactionDate] DESC, qbt.[Created] DESC
    `;
    console.log('Success! Rows:', result.recordset.length);
    console.log('Sample:', JSON.stringify(result.recordset[0], null, 2).substring(0, 500));

    console.log('\n=== Testing job balances query ===');
    const jb = await sql.query`
      SELECT TOP 2
        jb.[Id],
        jb.[JobId] as projectId,
        jb.[Balance] as currentBalance,
        jb.[DateUpdated],
        qbc.[Name] AS projectName,
        qbc.[FullyQualifiedName] AS projectFullName
      FROM dbo.[JobBalances] jb
      LEFT JOIN dbo.[QBClasses] qbc ON jb.[JobId] = qbc.[ListID]
      ORDER BY jb.[DateUpdated] DESC
    `;
    console.log('Success! Rows:', jb.recordset.length);
    console.log('Sample:', JSON.stringify(jb.recordset[0], null, 2));

  } catch (err) {
    console.error('Error:', err.message);
    console.error('Code:', err.code);
  } finally {
    await sql.close();
  }
}

test();
