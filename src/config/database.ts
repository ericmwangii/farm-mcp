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
   host: process.env.DB_HOST || 'localhost',
   port: parseInt(process.env.DB_PORT || '5432', 10),
   username: process.env.DB_USERNAME || 'emwangi',
   password: process.env.DB_PASSWORD || '',
   database: process.env.DB_DATABASE || 'farm_management',
   synchronize: true,
   logging: process.env.NODE_ENV === 'development',
   entities,
   subscribers: [],
   migrations: [],
   // Enable SSL for production
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