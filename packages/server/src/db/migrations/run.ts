import { query } from '../index';
import { migrations } from './index';

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
  
  for (const migration of migrations) {
    if (!executedMigrations.includes(migration.name)) {
      console.log(`Running migration: ${migration.name}`);
      await migration.up();
      await query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
      console.log(`Completed migration: ${migration.name}`);
    }
  }
}

run().catch(console.error);
