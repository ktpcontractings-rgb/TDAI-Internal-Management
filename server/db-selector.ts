// Database selector - switches between mock (development) and production database
import * as dotenv from 'dotenv';
dotenv.config();

// Use production database if DATABASE_URL or DATABASE_URL2 is set (Render/Neon)
// Otherwise use mock database for local development
const isProduction = !!(process.env.DATABASE_URL || process.env.DATABASE_URL2);

// Dynamic import based on environment
const dbModule = isProduction 
  ? await import('./db-production.js')
  : await import('./db.js');

export const db = dbModule.db;
