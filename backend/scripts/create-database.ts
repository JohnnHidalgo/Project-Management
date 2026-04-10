import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

const defaultUrl = process.env.DATABASE_URL ?? '';
if (!defaultUrl) {
  throw new Error('DATABASE_URL not set in .env');
}

const targetDbName = process.env.NEW_DATABASE_NAME ?? 'project_management';
const connectionString = new URL(defaultUrl);

// Connect to a superuser database (template1) to create database
connectionString.pathname = '/template1';

async function main() {
  const client = new Client({ connectionString: connectionString.toString() });
  await client.connect();

  const check = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDbName]);
  if (check.rowCount === 0) {
    console.log(`Creando la base de datos ${targetDbName}...`);
    await client.query(`CREATE DATABASE ${targetDbName}`);
    console.log('Base de datos creada.');
  } else {
    console.log(`La base de datos ${targetDbName} ya existe.`);
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
