import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

import path from 'path';

// 1. Tenta carregar o .env do diretório de execução atual
dotenv.config();

// 2. Se o processo foi iniciado na raiz do monorepo, busca na subpasta 'backend'
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
}

console.log('=== STATUS DA CONEXÃO DO BANCO ===');
console.log('CWD de Execução:', process.cwd());
console.log('DATABASE_URL Carregada:', process.env.DATABASE_URL ? 'Sim (Inicia com: ' + process.env.DATABASE_URL.substring(0, 20) + '...)' : 'Não');
console.log('==================================');

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
