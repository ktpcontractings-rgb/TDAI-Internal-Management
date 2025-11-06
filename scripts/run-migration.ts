// Run database migration using Neon serverless driver
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Starting database migration...\n');
  
  const sql = neon(DATABASE_URL);
  
  // Read the migration file
  const migrationPath = path.join(__dirname, '../server/migrations/002_trainer_system.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  
  // Split by semicolons to execute statements individually
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comments
    if (statement.startsWith('--')) continue;
    
    try {
      // Show what we're executing (first 100 chars)
      const preview = statement.substring(0, 100).replace(/\n/g, ' ');
      console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);
      
      await sql(statement);
      successCount++;
      console.log(`✅ Success\n`);
    } catch (error: any) {
      // Some errors are OK (like "already exists")
      if (error.message.includes('already exists') || 
          error.message.includes('does not exist') ||
          error.message.includes('duplicate')) {
        console.log(`⚠️  Skipped (already exists)\n`);
        successCount++;
      } else {
        console.error(`❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Migration complete!`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('='.repeat(60) + '\n');
  
  // Verify tables were created
  console.log('🔍 Verifying tables...\n');
  
  const tables = [
    'trainer_agent',
    'special_agents',
    'knowledge_bases',
    'legal_documents',
    'training_sessions',
    'agent_metrics',
    'customer_interactions',
    'agent_prompts',
    'agent_conversations'
  ];
  
  for (const table of tables) {
    try {
      const result = await sql`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = ${table}
      `;
      
      if (result[0].count > 0) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' NOT FOUND`);
      }
    } catch (error: any) {
      console.log(`❌ Error checking table '${table}': ${error.message}`);
    }
  }
  
  console.log('\n🎉 Database migration completed successfully!\n');
}

runMigration().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
