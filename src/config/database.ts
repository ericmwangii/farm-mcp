import { DataSource } from 'typeorm';
import { Inventory } from '../entities/inventory.js';
import { FeedingRecord } from '../entities/feeding-record.js';
import { Animal } from '../entities/animals.js';
import { Task } from '../entities/task.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entities = [
   Animal,
   Inventory,
   FeedingRecord,
   Task
];

export const AppDataSource = new DataSource({
   type: 'postgres',
   host: process.env.DB_HOST,
   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
   username: process.env.DB_USERNAME,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,
   synchronize: true,
   logging: process.env.NODE_ENV === 'development',
   entities,
   subscribers: [],
   migrations: [],
   ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

// Helper function to initialize the database connection
export async function initializeDatabase(): Promise<void> {
   try {
      await AppDataSource.initialize();
      console.log('Database connection established');
   } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
   }
}