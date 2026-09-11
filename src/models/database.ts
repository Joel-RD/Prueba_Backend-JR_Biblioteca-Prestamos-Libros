
import { Pool } from "pg";
import { configParams } from '../config_params.js'
 
const {db_host, db_user, db_password} = configParams;
const db_connection = new Pool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: 'Books_eudy_project',
    port: 5432
});

db_connection.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

const pool = db_connection;
export const query = async (query: string, params?: unknown[]) => {
  try {
    if (!params) return await pool.query(query)
    return await pool.query(query, params); 
  } catch (error) {
    console.error(error);
    throw error;
  }
};