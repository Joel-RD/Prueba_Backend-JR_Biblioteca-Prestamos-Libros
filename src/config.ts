
import enviorment from 'dotenv';
enviorment.config();

const { NODE_ENV, PORT_SERVER, PORT, DB_HOST,  DB_USER ,DB_PASSWORD } = process.env;

export const configParams = {
  env_flag: NODE_ENV || 'development',
  port: PORT_SERVER || PORT,
  db_host: DB_HOST || 'localhost',
  db_user: DB_USER || 'postgres',
  db_password: DB_PASSWORD || 'password',
};