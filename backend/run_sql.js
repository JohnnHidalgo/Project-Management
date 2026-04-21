// Ejecuta un archivo SQL completo usando la cadena DATABASE_URL
// Uso: node run_sql.js [DATABASE_URL] [SQL_FILE]

import fs from 'fs';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const argv = process.argv.slice(2);
const connectionString = argv[0] || process.env.DATABASE_URL;
const sqlFile = argv[1] || 'seed_p8_quoted.sql';

if (!connectionString) {
  console.error('DATABASE_URL no proporcionada. Pasa la cadena como primer argumento o define .env');
  process.exit(1);
}

if (!fs.existsSync(sqlFile)) {
  console.error('Archivo SQL no encontrado:', sqlFile);
  process.exit(1);
}

const sql = fs.readFileSync(sqlFile, { encoding: 'utf8' });

(async () => {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Conectado a la base. Ejecutando:', sqlFile);
    // Ejecutar todo el contenido; el archivo incluye BEGIN/COMMIT
    const res = await client.query(sql);
    console.log('Ejecución completada. Resultado:', res && res.rowCount !== undefined ? `rowCount=${res.rowCount}` : 'ok');
  } catch (err) {
    console.error('Error ejecutando SQL:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
