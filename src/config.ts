import dotenv from 'dotenv';
dotenv.config();

const { NODE_ENV, PORT_SERVER, PORT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export const envConfig = {
  environment: NODE_ENV || 'development',
  port: PORT_SERVER || PORT || 3000,
  dbHost: DB_HOST || 'localhost',
  dbPort: Number(DB_PORT) || 5432,
  dbUser: DB_USER || 'postgres',
  dbPassword: DB_PASSWORD || 'password',
  dbName: DB_NAME || 'library',
};