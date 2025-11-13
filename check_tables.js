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

async function checkTables() {
  try {
    await sql.connect(config);
    console.log('Connected to database\n');

    // Check for QBTransactions table
    console.log('=== Checking QBTransactions ===');
    try {
      const qbTrans = await sql.query`
        SELECT TOP 1 * FROM QBTransactions
      `;
      console.log('✅ QBTransactions exists');
      console.log('Columns:', Object.keys(qbTrans.recordset[0] || {}));
    } catch (err) {
      console.log('❌ QBTransactions error:', err.message);
    }

    console.log('\n=== Checking JobBalances ===');
    try {
      const jobBal = await sql.query`
        SELECT TOP 1 * FROM JobBalances
      `;
      console.log('✅ JobBalances exists');
      console.log('Columns:', Object.keys(jobBal.recordset[0] || {}));
    } catch (err) {
      console.log('❌ JobBalances error:', err.message);
    }

    console.log('\n=== Checking ProposalTemplates ===');
    try {
      const propTemp = await sql.query`
        SELECT TOP 1 * FROM ProposalTemplates
      `;
      console.log('✅ ProposalTemplates exists');
      console.log('Columns:', Object.keys(propTemp.recordset[0] || {}));
    } catch (err) {
      console.log('❌ ProposalTemplates error:', err.message);
    }

    console.log('\n=== Checking ProposalTemplatesLineItems ===');
    try {
      const propTempItems = await sql.query`
        SELECT TOP 1 * FROM ProposalTemplatesLineItems
      `;
      console.log('✅ ProposalTemplatesLineItems exists');
      console.log('Columns:', Object.keys(propTempItems.recordset[0] || {}));
    } catch (err) {
      console.log('❌ ProposalTemplatesLineItems error:', err.message);
    }

    console.log('\n=== Listing all tables with "QB" in name ===');
    const qbTables = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME LIKE '%QB%'
      ORDER BY TABLE_NAME
    `;
    console.log('QB-related tables:', qbTables.recordset.map(r => r.TABLE_NAME).join(', '));

    console.log('\n=== Listing all tables with "Job" in name ===');
    const jobTables = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME LIKE '%Job%'
      ORDER BY TABLE_NAME
    `;
    console.log('Job-related tables:', jobTables.recordset.map(r => r.TABLE_NAME).join(', '));

    console.log('\n=== Listing all tables with "Proposal" in name ===');
    const proposalTables = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME LIKE '%Proposal%'
      ORDER BY TABLE_NAME
    `;
    console.log('Proposal-related tables:', proposalTables.recordset.map(r => r.TABLE_NAME).join(', '));

    console.log('\n=== Listing all tables with "Deposit" or "Retainer" in name ===');
    const depositTables = await sql.query`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND (TABLE_NAME LIKE '%Deposit%' OR TABLE_NAME LIKE '%Retainer%')
      ORDER BY TABLE_NAME
    `;
    console.log('Deposit/Retainer-related tables:', depositTables.recordset.map(r => r.TABLE_NAME).join(', '));

  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await sql.close();
  }
}

checkTables();
