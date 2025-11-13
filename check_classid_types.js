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

async function check() {
  try {
    await sql.connect(config);

    console.log('=== Checking ClassID values ===');
    const result = await sql.query`
      SELECT TOP 5 ClassID, Name FROM QBTransactions 
      WHERE ClassID IS NOT NULL 
      ORDER BY TransactionDate DESC
    `;
    console.log('ClassID samples:', result.recordset);

    console.log('\n=== Checking ListID values ===');
    const listIds = await sql.query`
      SELECT TOP 5 ListID, Name FROM QBClasses
    `;
    console.log('ListID samples:', listIds.recordset);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.close();
  }
}

check();
