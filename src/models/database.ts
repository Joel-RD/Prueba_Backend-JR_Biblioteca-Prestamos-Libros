import { Pool, type PoolClient } from 'pg';
import { envConfig } from '../config.js';

const { dbHost, dbPort, dbUser, dbPassword, dbName } = envConfig;

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export { pool };

export const query = async (text: string, params?: unknown[]) => {
  if (!params) return pool.query(text);
  return pool.query(text, params);
};

export const transaction = async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};