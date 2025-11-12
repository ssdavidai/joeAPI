/**
 * Database Verification Script
 *
 * Verifies connection to chaconstruction-test database
 * Checks that all required tables exist
 * Validates schema matches expectations
 */

const { executeQuery, closePool } = require('../src/config/database');

const TIER1_TABLES = [
  'Clients',
  'Contacts',
  'Proposals',
  'ProposalLines',
  'Estimates',
  'ProjectManagements',
  'ProjectSchedules',
  'ProjectScheduleTasks',
  'ActionItems',
  'SubContractors'
];

const TIER2_TABLES = [
  'ProposalProjects',
  'EstimateCategories',
  'ProjectSupervisors',
  'ProjectSubContractors',
  'ProjectNotes',
  'ProjectDocuments',
  'ProjectScheduleDelays',
  'ConstructionTasks',
  'ActionItemComments',
  'ActionItemCostChange',
  'ActionItemScheduleChange',
  'ActionTypes',
  'ChangeOrders',
  'Invoices',
  'InvoiceItems',
  'SubContractorCategories'
];

async function verifyDatabase() {
  console.log('🔍 Starting database verification...\n');

  try {
    // 1. Test connection
    console.log('1️⃣  Testing database connection...');
    const healthCheck = await executeQuery('SELECT 1 AS test');
    if (healthCheck.recordset[0].test === 1) {
      console.log('   ✅ Connection successful\n');
    }

    // 2. Get database name
    console.log('2️⃣  Verifying database...');
    const dbCheck = await executeQuery('SELECT DB_NAME() AS database_name');
    const dbName = dbCheck.recordset[0].database_name;
    console.log(`   ✅ Connected to database: ${dbName}\n`);

    if (dbName !== 'chaconstruction-test') {
      console.error(`   ❌ ERROR: Expected 'chaconstruction-test', got '${dbName}'`);
      process.exit(1);
    }

    // 3. Check for Tier 1 tables
    console.log('3️⃣  Checking Tier 1 tables (Must-Have)...');
    const tier1Missing = [];
    const tier1Found = [];

    for (const table of TIER1_TABLES) {
      const result = await executeQuery(`
        SELECT COUNT(*) AS tableExists
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = 'dbo'
          AND TABLE_NAME = @tableName
      `, { tableName: table });

      if (result.recordset[0].tableExists === 1) {
        // Get row count
        const countResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[${table}]`);
        const rowCount = countResult.recordset[0].cnt;
        tier1Found.push({ table, rows: rowCount });
        console.log(`   ✅ ${table.padEnd(25)} (${rowCount} rows)`);
      } else {
        tier1Missing.push(table);
        console.log(`   ❌ ${table.padEnd(25)} NOT FOUND`);
      }
    }

    if (tier1Missing.length > 0) {
      console.error(`\n   ⚠️  Missing ${tier1Missing.length} Tier 1 tables!`);
      console.error('   Tables:', tier1Missing.join(', '));
    } else {
      console.log(`\n   ✅ All ${TIER1_TABLES.length} Tier 1 tables found`);
    }

    // 4. Check for Tier 2 tables
    console.log('\n4️⃣  Checking Tier 2 tables (Should-Have)...');
    const tier2Missing = [];
    const tier2Found = [];

    for (const table of TIER2_TABLES) {
      const result = await executeQuery(`
        SELECT COUNT(*) AS tableExists
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = 'dbo'
          AND TABLE_NAME = @tableName
      `, { tableName: table });

      if (result.recordset[0].tableExists === 1) {
        const countResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[${table}]`);
        const rowCount = countResult.recordset[0].cnt;
        tier2Found.push({ table, rows: rowCount });
        console.log(`   ✅ ${table.padEnd(30)} (${rowCount} rows)`);
      } else {
        tier2Missing.push(table);
        console.log(`   ❌ ${table.padEnd(30)} NOT FOUND`);
      }
    }

    if (tier2Missing.length > 0) {
      console.log(`\n   ⚠️  Missing ${tier2Missing.length} Tier 2 tables:`);
      console.log('   ', tier2Missing.join(', '));
    } else {
      console.log(`\n   ✅ All ${TIER2_TABLES.length} Tier 2 tables found`);
    }

    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Database: ${dbName}`);
    console.log(`Tier 1 Tables: ${tier1Found.length}/${TIER1_TABLES.length} found`);
    console.log(`Tier 2 Tables: ${tier2Found.length}/${TIER2_TABLES.length} found`);
    console.log(`Total Records (Tier 1): ${tier1Found.reduce((sum, t) => sum + t.rows, 0)}`);
    console.log(`Total Records (Tier 2): ${tier2Found.reduce((sum, t) => sum + t.rows, 0)}`);

    if (tier1Missing.length === 0 && tier2Missing.length === 0) {
      console.log('\n✅ Database verification PASSED');
      console.log('All required tables are present and accessible');
    } else {
      console.log('\n⚠️  Database verification COMPLETED WITH WARNINGS');
      console.log(`Missing ${tier1Missing.length + tier2Missing.length} tables`);
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Database verification FAILED');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run verification
verifyDatabase();
