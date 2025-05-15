import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../index';

async function createMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await query('SELECT name FROM migrations ORDER BY id ASC');
  return result.rows.map(row => row.name);
}

async function run() {
  await createMigrationsTable();
  const executedMigrations = await getExecutedMigrations();
  
  const migrationFiles = ['0000_initial.sql'];
  
  for (const file of migrationFiles) {
    if (!executedMigrations.includes(file)) {
      console.log(`Running migration: ${file}`);
      const sql = readFileSync(join(__dirname, file), 'utf8');
      await query(sql);
      await query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      console.log(`Completed migration: ${file}`);
    }
  }
}

run().catch(console.error);
