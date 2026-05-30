import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração do pool de conexões com tratamento de erro
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no Pool do PostgreSQL:', err);
});

export const db = drizzle(pool, { schema });
export { pool };
