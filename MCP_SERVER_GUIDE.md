# Building a Production-Ready MCP Server with TypeScript and PostgreSQL

*A deep dive into creating a robust farm management system that integrates with Claude Desktop*

## Introduction

The Model Context Protocol (MCP) represents a significant advancement in how AI systems like Claude can interact with external tools and data sources. By creating a standardized interface between AI models and external systems, MCP enables seamless integration of AI capabilities with your custom applications, databases, and services.

In this comprehensive guide, I'll walk you through building a production-ready MCP server using TypeScript and PostgreSQL, based on our experience developing the Shamba Boy farm management system. This isn't just a theoretical exercise—we'll examine actual code from our implementation, discussing architectural decisions, design patterns, and best practices that we've learned along the way.

### Why TypeScript and PostgreSQL?

Before diving into the implementation details, let's briefly discuss why we chose this particular tech stack:

**TypeScript** provides several advantages for building robust MCP servers:

- **Static typing**: Catches type-related errors at compile time rather than runtime
- **Enhanced IDE support**: Better code completion, navigation, and refactoring
- **Self-documenting code**: Types serve as documentation for your API
- **Modern JavaScript features**: Access to the latest ECMAScript features with backward compatibility

**PostgreSQL** complements our stack with:

- **Reliability**: Battle-tested in production environments for decades
- **ACID compliance**: Ensures data integrity even during failures
- **JSON support**: Native JSON and JSONB data types for flexible schemas
- **Scalability**: Excellent performance for both small and large datasets
- **Extensions**: Rich ecosystem of extensions for specialized functionality

### The Shamba Boy Project

Shamba Boy is a farm management system designed to help farmers track:

- **Inventory**: Seeds, feed, equipment, and supplies
- **Animals**: Livestock records including health status and feeding schedules
- **Tasks**: Farm operations and maintenance schedules

By exposing these capabilities through an MCP server, we enable farmers to interact with their data using natural language through Claude Desktop. This creates a more intuitive and accessible interface for users who might not be technically inclined.

### What You'll Learn

By the end of this guide, you'll understand:

1. How to set up a TypeScript project with the necessary dependencies
2. Designing a robust database schema with TypeORM
3. Implementing MCP tools that expose your business logic
4. Error handling and validation strategies
5. Data export and reporting capabilities
6. Testing and deploying your MCP server

Let's get started by exploring the architecture of our system.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Configuration](#database-configuration)
4. [MCP Server Implementation](#mcp-server-implementation)
5. [Defining Tools and Resources](#defining-tools-and-resources)
6. [Running the Server](#running-the-server)
7. [Testing with Claude Desktop](#testing-with-claude-desktop)
8. [Best Practices](#best-practices)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16+)
- PostgreSQL (v13+)
- Claude Desktop
- npm or yarn

## Project Setup

1. **Initialize a new TypeScript project** (if starting from scratch):
   ```bash
   mkdir shamba-boy
   cd shamba-boy
   npm init -y
   npm install typescript ts-node @types/node --save-dev
   npx tsc --init
   ```

2. **Install required dependencies**:
   ```bash
   npm install @modelcontextprotocol/sdk typeorm pg reflect-metadata zod
   npm install dotenv --save
   ```

3. **Update `tsconfig.json`** with these settings:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ES2020",
       "moduleResolution": "node",
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "emitDecoratorMetadata": true,
       "experimentalDecorators": true,
       "skipLibCheck": true,
       "resolveJsonModule": true,
       "sourceMap": true,
       "declaration": true
     },
     "include": ["src/**/*.ts"],
     "exclude": ["node_modules"]
   }
   ```

## Database Architecture and Configuration

### The Foundation: PostgreSQL and TypeORM

A robust database layer is the foundation of any successful MCP server. For Shamba Boy, we chose PostgreSQL paired with TypeORM to create a type-safe, maintainable data layer. This combination gives us the reliability of a battle-tested relational database with the developer experience of a modern ORM.

### Setting Up PostgreSQL

First, let's set up our PostgreSQL database. If you're on macOS, you can use Homebrew:

```bash
# Install PostgreSQL
brew install postgresql

# Start the PostgreSQL service
brew services start postgresql

# Create a new database for our project
createdb farm_management

# Create a dedicated user (with password prompt)
createuser -P emwangi

# Grant privileges to the user
psql -d farm_management -c "GRANT ALL PRIVILEGES ON DATABASE farm_management TO emwangi;"
```

For Linux or Windows users, the commands will differ slightly, but the concepts remain the same.

### Environment Configuration

Following the principles of the [Twelve-Factor App](https://12factor.net/), we store all configuration in environment variables. Create a `.env` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=emwangi
DB_PASSWORD=your_secure_password
DB_DATABASE=farm_management

# Application Settings
NODE_ENV=development
PORT=3000

# Logging
LOG_LEVEL=debug
```

> 💡 **Pro Tip:** Always add `.env` to your `.gitignore` file to prevent sensitive credentials from being committed to your repository. Instead, provide a `.env.example` file with placeholder values.

### TypeORM Configuration

Now, let's set up TypeORM to connect to our PostgreSQL database. Create a file at `src/config/database.ts`:

```typescript
import { DataSource } from 'typeorm';
import { Inventory } from '../entities/inventory.js';
import { Animal } from '../entities/animals.js';
import { Task } from '../entities/task.js';
import { FeedingRecord } from '../entities/feeding-record.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

// Handle ES module file paths (for Node.js ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Group entities for better organization
const entities = [
  Animal,
  Inventory,
  Task,
  FeedingRecord
];

// Create and export the data source configuration
export const AppDataSource = new DataSource({
  // Database connection details
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'farm_management',
  
  // Development settings
  synchronize: true, // Auto-creates tables based on entities (disable in production!)
  logging: process.env.NODE_ENV === 'development', // Log SQL queries in development
  
  // Entity registration
  entities,
  
  // For future use
  migrations: [],
  subscribers: [],
  
  // SSL configuration for production environments
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false } // Allows self-signed certificates
    : false,
});

/**
 * Initializes the database connection
 * This function should be called at application startup
 */
export async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error; // Rethrow to let the application handle the error
  }
```

### Key Configuration Decisions Explained

1. **ES Modules Support**
   
We're using ECMAScript modules (ESM) instead of CommonJS, which is why our imports have `.js` extensions even for TypeScript files. This is because TypeScript compiles `.ts` files to `.js` files, and the imports need to reference the compiled output.

2. **Synchronize Mode**
   
The `synchronize: true` option automatically creates database tables based on our entity definitions. This is incredibly convenient during development but should **never** be used in production as it can lead to data loss during schema changes.

```typescript
// Development configuration
synchronize: true, // Auto-creates tables based on entities

// Production configuration (use migrations instead)
synchronize: false,
```

3. **Logging Configuration**
   
We enable SQL query logging in development mode to help with debugging and performance optimization:

```typescript
logging: process.env.NODE_ENV === 'development',
```

In a production environment, you might want to log only errors or slow queries.

4. **SSL Configuration**
   
For production deployments, especially in cloud environments, we configure SSL to ensure secure database connections:

```typescript
ssl: process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: false } // Allows self-signed certificates
  : false,
```

The `rejectUnauthorized: false` option allows connections to servers with self-signed certificates, which is common in some cloud environments. For proper production deployments, you should use valid certificates.

5. **Error Handling**
   
Our `initializeDatabase` function includes proper error handling and logging, ensuring that database connection issues are clearly reported and can be addressed:

```typescript
try {
  await AppDataSource.initialize();
  console.log('Database connection established');
} catch (error) {
  console.error('Error initializing database:', error);
  throw error; // Rethrow to let the application handle the error
}
```

### Entity Relationship Model

Before diving into entity definitions, let's understand the relationships between our main entities:

```
┌─────────────┐       ┌───────────────┐       ┌─────────────┐
│   Animal    │       │      Task     │       │  Inventory  │
├─────────────┤       ├───────────────┤       ├─────────────┤
│ id          │       │ id            │       │ id          │
│ name        │       │ description   │       │ item_name   │
│ type        │◄──────┤ animal_id     │       │ category    │
│ age         │       │ inventory_id  │◄──────┤ quantity    │
│ weight      │       │ due_date      │       │ unit        │
│ health_status│       │ status        │       │ last_updated│
└─────────┬───┘       │ priority      │       └─────────────┘
          │           └───────────────┘
          │                                   ┌─────────────────┐
          │                                   │  FeedingRecord  │
          │                                   ├─────────────────┤
          │                                   │ id              │
          └───────────────────────────────────┤ animal_id       │
                                              │ feed_type       │
                                              │ quantity        │
                                              │ feeding_time    │
                                              └─────────────────┘
```

This diagram illustrates how our entities relate to each other:
- An animal can have multiple feeding records
- A task can be associated with an animal and/or inventory item
- Inventory items track farm supplies and equipment

In the next section, we'll look at how to define these entities using TypeORM decorators.
     }
   }
   ```

## Building the MCP Server Core

### Understanding the Model Context Protocol

The Model Context Protocol (MCP) is the bridge that allows Claude to interact with our farm management system. At its core, MCP defines a standardized way for AI models to discover and use external tools and resources. Let's break down how it works:

1. **Tools**: Functions that Claude can call to perform actions (e.g., checking inventory, adding animals)
2. **Resources**: Data that Claude can read (e.g., documentation, reference materials)
3. **Transport Layer**: The communication mechanism between Claude and our server (typically stdio)

### Setting Up the MCP Server

Let's create our main server file at `src/index.ts`. This file will serve as the entry point for our application and will initialize both our MCP server and database connection:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AppDataSource } from "./config/database.js";
import { Inventory } from "./entities/inventory.js";
import { Animal } from "./entities/animals.js";
import { Task, TaskPriority } from "./entities/task.js";
import { exportToCsv } from "./utils/export-utils.js";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Handle ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize MCP Server with metadata
const server = new McpServer({
  name: "shamba-boy",  // Server name (displayed in Claude Desktop)
  version: "1.0.0",    // Semantic versioning
  capabilities: {
    resources: {},      // We'll define resources later if needed
    tools: {},         // Tools will be registered programmatically
  },
});

// Initialize database connection
async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.error('Database connection established');  // Using console.error for stdout in MCP context
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;  // Rethrow to handle at the application level
  }
}

// Main function to start the server
async function main() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Create transport layer (stdio for Claude Desktop)
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    server.connect(transport);
    
    console.error('MCP Server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);  // Exit with error code
  }
}

// Start the server
main();
```

### Key Components Explained

#### 1. Server Initialization

The `McpServer` constructor takes a configuration object that defines the server's identity and capabilities:

```typescript
const server = new McpServer({
  name: "shamba-boy",  // Server name (displayed in Claude Desktop)
  version: "1.0.0",    // Semantic versioning
  capabilities: {
    resources: {},      // We'll define resources later if needed
    tools: {},         // Tools will be registered programmatically
  },
});
```

The `name` and `version` fields are displayed in Claude Desktop, helping users identify your server. The `capabilities` object defines what your server can do, though we'll register our tools programmatically rather than declaring them here.

#### 2. Transport Layer

The transport layer handles communication between Claude and our server. For Claude Desktop, we use the `StdioServerTransport` which communicates via standard input/output:

```typescript
const transport = new StdioServerTransport();
server.connect(transport);
```

This simple approach works well for local development and deployment. For more complex scenarios, you could implement custom transport layers.

#### 3. Error Handling Strategy

Notice our robust error handling throughout the initialization process:

```typescript
try {
  await initializeDatabase();
  // ...more initialization code
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);  // Exit with error code
}
```

We catch errors at each level, log them clearly, and exit with a non-zero code if there's a fatal error. This approach makes debugging easier and ensures the application fails fast if there are critical issues.

#### 4. Console Output

You might notice we use `console.error` instead of `console.log` in several places:

```typescript
console.error('Database connection established');
```

This is because the MCP protocol uses stdout for communication with Claude, so we use stderr for our logging to avoid interfering with the protocol messages.

### Debugging Tips

1. **Enable TypeORM Logging**: Set `logging: true` in your TypeORM configuration to see all SQL queries.

2. **Use Environment Variables**: Create different `.env` files for development and testing.

3. **Inspect MCP Messages**: You can add debug code to log the messages being sent between Claude and your server:

```typescript
// Debug transport messages (add before server.connect)
transport.onMessage.subscribe(message => {
  fs.appendFileSync('mcp-debug.log', `Received: ${JSON.stringify(message)}
`);
});
```

Now that we have our server skeleton in place, let's move on to implementing the tools that will make our MCP server useful.

## Designing and Implementing MCP Tools

### The Anatomy of an MCP Tool

MCP tools are the heart of your server's functionality. Each tool represents a capability that Claude can use to interact with your application. In the Shamba Boy system, we've implemented tools for inventory management, animal tracking, task management, and data export.

Every MCP tool has four key components:

1. **Name**: A unique identifier used by Claude to reference the tool
2. **Description**: A human-readable explanation of what the tool does
3. **Parameters Schema**: The input parameters the tool accepts, defined using Zod
4. **Handler Function**: The actual implementation that executes when Claude calls the tool

Let's explore how to implement these tools with real-world examples from our codebase.

### Example 1: Inventory Management Tool

Our first tool allows Claude to check the current inventory levels, with optional filtering by item name or category:

```typescript
// Tool to check inventory
server.tool(
  "check-inventory",  // Tool name - should be kebab-case and descriptive
  "Check inventory items",  // Human-readable description
  {
    // Parameter schema using Zod for validation
    item: z.string().optional().describe("Filter by item name"),
    category: z.string().optional().describe("Filter by category"),
  },
  // Handler function - implements the actual business logic
  async ({ item, category }) => {
    try {
      // Get the repository for database access
      const inventoryRepo = AppDataSource.getRepository(Inventory);
      
      // Build a query with TypeORM's query builder
      let query = inventoryRepo.createQueryBuilder("inventory");

      // Add filters if provided
      if (item) {
        // Case-insensitive partial match for item names
        query = query.where("inventory.item_name LIKE :item", { item: `%${item}%` });
      }

      if (category) {
        // Exact match for category
        query = query.andWhere("inventory.category = :category", { category });
      }

      // Execute the query
      const items = await query.getMany();

      // Format the response for Claude
      if (items.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No inventory items found matching the criteria",
            },
          ],
        };
      }

      // Transform data for better readability
      const formattedItems = items.map(item => ({
        id: item.id,
        name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit || 'units',
        lastUpdated: item.last_updated?.toLocaleDateString() || 'N/A'
      }));

      // Return formatted response
      return {
        content: [
          {
            type: "text",
            text: `Inventory Items (${formattedItems.length}):

${formattedItems
              .map(i => `${i.name} (${i.category}): ${i.quantity} ${i.unit}`)
              .join('
')}`,
          },
        ],
      };
    } catch (error) {
      // Proper error handling and logging
      console.error('Error checking inventory:', error);
      return {
        content: [
          {
            type: "text",
            text: "An error occurred while checking inventory",
          },
        ],
      };
    }
  },
);
```

### Key Design Patterns

#### 1. Parameter Validation with Zod

Zod provides a powerful way to define and validate input parameters:

```typescript
{
  item: z.string().optional().describe("Filter by item name"),
  category: z.string().optional().describe("Filter by category"),
  minQuantity: z.number().optional().describe("Minimum quantity threshold"),
}
```

This schema defines three optional parameters: `item` and `category` as strings, and `minQuantity` as a number. The `.describe()` method provides documentation that Claude will use to understand how to use the parameter.

#### 2. Structured Error Handling

Notice our comprehensive error handling pattern:

```typescript
try {
  // Business logic implementation
} catch (error) {
  // 1. Log the error for debugging
  console.error('Error checking inventory:', error);
  
  // 2. Return a user-friendly error message
  return {
    content: [
      {
        type: "text",
        text: "An error occurred while checking inventory",
      },
    ],
  };
}
```

This approach ensures:
- Errors are logged for debugging
- Users receive a friendly message instead of a technical error
- The application continues running despite the error

#### 3. Response Formatting

We format our responses to be human-readable:

```typescript
return {
  content: [
    {
      type: "text",
      text: `Inventory Items (${formattedItems.length}):

${formattedItems
        .map(i => `${i.name} (${i.category}): ${i.quantity} ${i.unit}`)
        .join('
')}`,
    },
  ],
};
```

This structured format makes it easy for Claude to present the information to users in a clear, readable way.

### Example 2: Animal Management Tool

Let's look at another example - a tool for adding new animals to the farm:

```typescript
// Tool to add a new animal
server.tool(
  "add-animal",
  "Add a new animal to the farm",
  {
    name: z.string().describe("Animal's name"),
    species: z.string().describe("Animal species"),
    breed: z.string().optional().describe("Animal breed (optional)"),
    dateOfBirth: z.string().optional().describe("Date of birth (YYYY-MM-DD)")
  },
  async ({ name, species, breed, dateOfBirth }) => {
    try {
      // Create a new animal entity
      const animalRepo = AppDataSource.getRepository(Animal);
      const animal = animalRepo.create({
        name,
        species,
        breed,
        date_of_birth: dateOfBirth ? new Date(dateOfBirth) : undefined
      });
      
      // Save to database
      const savedAnimal = await animalRepo.save(animal);

      // Return success response with details
      return {
        content: [
          {
            type: "text",
            text: `Successfully added ${savedAnimal.name} (${savedAnimal.species}) to the farm.`,
          },
        ],
      };
    } catch (error) {
      console.error('Error adding animal:', error);
      return {
        content: [
          {
            type: "text",
            text: "An error occurred while adding the animal",
          },
        ],
      };
    }
  }
);
```

### Advanced Tool: Data Export

One of our more complex tools is the data export functionality, which leverages our utility functions to generate CSV files:

```typescript
// Export data to CSV
server.tool(
  "export-data",
  "Export data to CSV",
  {
    dataType: z.enum(['tasks', 'inventory', 'animals']).describe("Type of data to export"),
  },
  async ({ dataType }) => {
    try {
      let data: any[] = [];
      let filename = '';

      // Fetch the appropriate data based on type
      switch (dataType) {
        case 'tasks':
          data = await AppDataSource.getRepository(Task).find();
          filename = 'tasks.csv';
          break;
        case 'inventory':
          data = await AppDataSource.getRepository(Inventory).find();
          filename = 'inventory.csv';
          break;
        case 'animals':
          data = await AppDataSource.getRepository(Animal).find();
          filename = 'animals.csv';
          break;
      }

      if (data.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No ${dataType} data found to export`,
            },
          ],
        };
      }

      // Generate CSV content using our utility function
      const csvContent = exportToCsv(data);
      const exportPath = path.join(__dirname, '..', 'exports', filename);

      // Ensure exports directory exists
      const exportsDir = path.join(__dirname, '..', 'exports');
      if (!require('fs').existsSync(exportsDir)) {
        require('fs').mkdirSync(exportsDir, { recursive: true });
      }

      // Write the file
      writeFileSync(exportPath, csvContent, 'utf8');

      return {
        content: [
          {
            type: "text",
            text: `Successfully exported ${data.length} ${dataType} to ${exportPath}`,
          },
        ],
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return {
        content: [
          {
            type: "text",
            text: `An error occurred while exporting ${dataType} data`,
          },
        ],
      };
    }
  },
);
```

### Best Practices for Tool Design

1. **Descriptive Names and Documentation**
   - Use clear, descriptive names for tools and parameters
   - Provide detailed descriptions that explain what each tool and parameter does

2. **Input Validation**
   - Always validate input parameters using Zod
   - Use appropriate types and constraints (e.g., `z.number().min(0)` for quantities)
   - Make parameters optional when appropriate

3. **Consistent Response Format**
   - Follow a consistent pattern for success and error responses
   - Format data for human readability
   - Include metadata like counts when returning collections

4. **Comprehensive Error Handling**
   - Catch and log all errors
   - Provide user-friendly error messages
   - Include context in error messages when possible

5. **Modular Design**
   - Consider moving complex business logic to service classes
   - Keep tool handlers focused on parameter validation and response formatting
   - Reuse code across similar tools

By following these patterns and best practices, you can create a robust set of tools that make your MCP server truly useful and user-friendly.
   ```

## Running the Server

1. **Add scripts to package.json**:
   ```json
   "scripts": {
     "build": "tsc",
     "start": "node dist/index.js",
     "dev": "NODE_OPTIONS='--loader ts-node/esm' node --inspect src/index.ts",
     "watch": "tsc --watch"
   }
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

## Testing with Claude Desktop

1. **Create a `claude.json` configuration file**:
   ```json
   {
     "name": "shamba-boy",
     "version": "1.0.0",
     "main": "dist/index.js",
     "description": "Farm management system for tracking animals and inventory",
     "capabilities": {
       "tools": [
         "check-inventory",
         "add-animal"
       ]
     }
   }
   ```



## Code Deep Dive

### 1. Project Structure Overview

```
src/
├── config/
│   └── database.ts       # Database configuration
├── entities/            # TypeORM entity definitions
│   ├── inventory.ts
│   ├── animals.ts
│   ├── task.ts
│   └── feeding-record.ts
├── utils/
│   └── export-utils.ts  # Utility functions for data export
└── index.ts             # Main application entry point
```

### 2. Database Configuration (database.ts)

The `database.ts` file sets up the connection to PostgreSQL using TypeORM:

```typescript
// Import required dependencies and entities
import { DataSource } from 'typeorm';
import { Inventory } from '../entities/inventory.js';
import { Animal } from '../entities/animals.js';
// ... other entity imports ...

// Configure the data source
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'emwangi',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'farm_management',
  synchronize: true,  // Auto-create database tables
  logging: process.env.NODE_ENV === 'development',
  entities: [Inventory, Animal, /* ... */],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize database connection
export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
```

Key points:
- Uses environment variables for configuration
- Auto-synchronizes database schema in development
- Supports SSL for production environments
- Centralized error handling

### 3. Entity Definitions

#### Inventory Entity (inventory.ts)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("inventory")
export class Inventory {
   @PrimaryGeneratedColumn()
   id!: number;

   @Column()
   item_name!: string;

   @Column({ nullable: true })
   category?: string;

   @Column({ type: "decimal", precision: 10, scale: 2 })
   quantity!: number;

   @Column({ nullable: true })
   unit?: string;

   @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
   last_updated!: Date;

   @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
   created_at!: Date;

   @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
   updated_at!: Date;
}
```

Key features:
- Uses TypeORM decorators to define the database schema
- Auto-generated timestamps for creation and updates
- TypeScript types for type safety
- Nullable fields where appropriate

### 4. Main Application (index.ts)

The main entry point sets up the MCP server and defines the available tools:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AppDataSource } from "./config/database.js";
import { Inventory } from "./entities/inventory.js";

// Initialize MCP Server
const server = new McpServer({
  name: "shamba-boy",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Tool: Check Inventory
server.tool(
  "check-inventory",
  "Check inventory items",
  {
    item: z.string().optional().describe("Filter by item name"),
    category: z.string().optional().describe("Filter by category"),
  },
  async ({ item, category }) => {
    // Implementation...
  }
);

// Initialize and start the server
async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
    
    const transport = new StdioServerTransport();
    server.connect(transport);
    console.log('MCP Server is running...');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
```

### 5. Export Utilities (export-utils.ts)

Handles data export functionality in multiple formats:

```typescript
export function exportToCsv(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  let csvContent = headers.join(',') + '\n';

  data.forEach(item => {
    const row = headers.map(header => {
      let value = item[header];
      // Handle special characters and formatting
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') value = JSON.stringify(value);
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
}

export type ExportFormat = 'json' | 'csv' | 'txt';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  data: any;
}

export function exportReport(options: ExportOptions) {
  // Implementation for different export formats
}
```

### 6. Package.json Configuration

Key scripts and dependencies:

```json
{
  "name": "shamba-boy",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "NODE_OPTIONS='--loader ts-node/esm' node --inspect src/index.ts",
    "mcp": "NODE_OPTIONS='--loader ts-node/esm' node --inspect src/mcp-server.ts",
    "watch": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "csv-writer": "^1.6.0",
    "dotenv": "^16.5.0",
    "pg": "^8.16.0",
    "reflect-metadata": "^0.2.2",
    "typeorm": "^0.3.24",
    "zod": "^3.25.23"
  },
  "devDependencies": {
    "@types/node": "^22.15.21",
    "@types/pg": "^8.11.6",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.3"
  }
}
```

## Best Practices

1. **Error Handling**:
   - Always wrap database operations in try/catch blocks
   

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [TypeORM Documentation](https://typeorm.io/)
- [Zod Documentation](https://zod.dev/)
- [Claude Desktop](https://claude.ai/download)

---

This guide provides a solid foundation for building an MCP server with TypeScript and PostgreSQL. Customize it according to your specific requirements and scale as needed.
