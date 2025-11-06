/**
 * Database Migration Script for Trainer Tables
 * 
 * This script creates the trainer_agent and special_agents tables in the production database.
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function migrate() {
  console.log('🚀 Starting database migration for Trainer tables...\n');
  
  const sql = postgres(DATABASE_URL);
  
  try {
    // Create trainer_agent table
    console.log('📝 Creating trainer_agent table...');
    await sql`
      CREATE TABLE IF NOT EXISTS trainer_agent (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        total_agents_trained INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ trainer_agent table created\n');
    
    // Create special_agents table
    console.log('📝 Creating special_agents table...');
    await sql`
      CREATE TABLE IF NOT EXISTS special_agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT,
        specialty TEXT NOT NULL,
        persona JSONB,
        knowledge_base_id TEXT,
        performance_score DECIMAL(5, 2),
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_trained_at TIMESTAMP
      )
    `;
    console.log('✅ special_agents table created\n');
    
    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('trainer_agent', 'special_agents')
    `;
    
    console.log('✅ Found tables:', tables.map(t => t.table_name).join(', '));
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Next steps:');
    console.log('   1. Visit the Trainer Dashboard');
    console.log('   2. Click "Initialize The Trainer"');
    console.log('   3. Create your first Special Agent');
    console.log('   4. Start chatting with your AI legal specialists!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
