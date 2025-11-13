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

    console.log('=== ProposalTemplatesLineItems columns ===');
    const cols = await sql.query`SELECT TOP 1 * FROM ProposalTemplatesLineItems`;
    console.log('Columns:', Object.keys(cols.recordset[0] || {}));
    console.log('\nSample:', JSON.stringify(cols.recordset[0], null, 2));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.close();
  }
}

check();
