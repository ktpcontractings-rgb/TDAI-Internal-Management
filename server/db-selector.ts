// Database selector - switches between mock (development) and production database
import * as dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Dynamic import based on environment
const dbModule = isProduction 
  ? await import('./db-production.js')
  : await import('./db.js');

export const db = dbModule.db;
