import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const migrate = async (connectionString: string | undefined) => {
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not defined');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const migrationsDir = path.join(__dirname, '../migrations');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found');
      await pool.end();
      return;
    }

    let appliedCount = 0;
    for (const file of files) {
      const result = await pool.query(
        'SELECT 1 FROM migrations WHERE filename = $1',
        [file]
      );

      if (result.rows.length === 0) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log(`Applying: ${file}`);
        await pool.query(sql);
        await pool.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        );

        appliedCount++;
      } else {
        console.log(`Skipped: ${file} (already applied)`);
      }
    }

    if (appliedCount > 0) {
      console.log(`\nSuccessfully applied ${appliedCount} migration(s)`);
    } else {
      console.log('\nDatabase is up to date');
    }
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

migrate(process.env.DATABASE_URL);
