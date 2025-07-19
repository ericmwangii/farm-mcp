import 'reflect-metadata';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new McpServer({
  name: "shamba-boy",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Initialize database connection
async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.error('Database connection established');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Tool to check inventory
server.tool(
  "check-inventory",
  "Check inventory items",
  {
    item: z.string().optional().describe("Filter by item name"),
    category: z.string().optional().describe("Filter by category"),
  },
  async ({ item, category }) => {
    try {
      const inventoryRepo = AppDataSource.getRepository(Inventory);
      let query = inventoryRepo.createQueryBuilder("inventory");

      if (item) {
        query = query.where("inventory.item_name LIKE :item", { item: `%${item}%` });
      }
      if (category) {
        query = query.andWhere("inventory.category = :category", { category });
      }

      const items = await query.getMany();

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

      const formattedItems = items.map(item => ({
        id: item.id,
        name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit || 'units',
        lastUpdated: item.last_updated?.toLocaleDateString() || 'N/A'
      }));

      return {
        content: [
          {
            type: "text",
            text: `Inventory Items (${formattedItems.length}):\n\n${formattedItems
              .map(i => `${i.name} (${i.category}): ${i.quantity} ${i.unit}`)
              .join('\n')}`,
          },
        ],
      };
    } catch (error) {
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

// Tool to list animals
server.tool(
  "list-animals",
  "List all animals in the farm",
  {},
  async () => {
    try {
      const animals = await AppDataSource.getRepository(Animal).find();

      if (animals.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No animals found in the database",
            },
          ],
        };
      }

      const formattedAnimals = animals.map(animal => ({
        id: animal.id,
        name: animal.name || 'Unnamed',
        type: animal.type || 'Unknown',
        age: animal.age ? `${animal.age} years` : 'Unknown',
        weight: animal.weight ? `${animal.weight} kg` : 'Unknown',
        healthStatus: animal.health_status || 'Unknown',
        lastFed: animal.last_fed?.toLocaleString() || 'Never'
      }));

      return {
        content: [
          {
            type: "text",
            text: `Animals (${formattedAnimals.length}):\n\n${formattedAnimals
              .map(a => `${a.name} (${a.type}) - Age: ${a.age}, Health: ${a.healthStatus}`)
              .join('\n')}`,
          },
        ],
      };
    } catch (error) {
      console.error('Error listing animals:', error);
      return {
        content: [
          {
            type: "text",
            text: "An error occurred while listing animals",
          },
        ],
      };
    }
  },
);

// Tool to list tasks
server.tool(
  "list-tasks",
  "List all tasks",
  {
    status: z.enum(['pending', 'in-progress', 'completed']).optional().describe("Filter by task status"),
  },
  async ({ status }) => {
    try {
      const taskRepo = AppDataSource.getRepository(Task);
      const query = status
        ? taskRepo.createQueryBuilder("task").where("task.status = :status", { status })
        : taskRepo.createQueryBuilder("task");

      const tasks = await query.getMany();

      if (tasks.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: status ? `No ${status} tasks found` : "No tasks found",
            },
          ],
        };
      }

      const formattedTasks = tasks.map(task => ({
        id: task.id,
        description: task.description || 'No description',
        dueDate: task.dueDate?.toLocaleDateString() || 'No due date',
        priority: task.priority || 'medium',
        status: task.status || 'pending'
      }));

      return {
        content: [
          {
            type: "text",
            text: `Tasks (${formattedTasks.length}):\n\n${formattedTasks
              .map(t => `[${t.status.toUpperCase()}] ${t.description} (Due: ${t.dueDate}, Priority: ${t.priority})`)
              .join('\n')}`,
          },
        ],
      };
    } catch (error) {
      console.error('Error listing tasks:', error);
      return {
        content: [
          {
            type: "text",
            text: "An error occurred while listing tasks",
          },
        ],
      };
    }
  },
);

async function main() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start MCP server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Shamba Boy MCP Server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Add a new task
server.tool(
  "add-task",
  "Add a new task",
  {
    description: z.string().describe("Task description"),
    dueDate: z.string().describe("Due date (YYYY-MM-DD)"),
    priority: z.enum(['low', 'medium', 'high']).default('medium').describe("Task priority"),
  },
  async ({ description, dueDate, priority }) => {
    try {
      const task = new Task();
      task.description = description;
      task.dueDate = new Date(dueDate);
      task.priority = priority as TaskPriority;
      task.status = 'pending';

      const savedTask = await AppDataSource.getRepository(Task).save(task);

      return {
        content: [
          {
            type: "text",
            text: `Task added successfully! ID: ${savedTask.id}`,
          },
        ],
      };
    } catch (error) {
      console.error('Error adding task:', error);
      return {
        content: [
          {
            type: "text",
            text: "An error occurred while adding the task",
          },
        ],
      };
    }
  },
);

// Mark task as complete
server.tool(
  "complete-task",
  "Mark a task as complete",
  {
    taskId: z.string().describe("ID of the task to mark as complete"),
  },
  async ({ taskId }) => {
    try {
      const taskRepo = AppDataSource.getRepository(Task);
      const task = await taskRepo.findOneBy({ id: taskId });

      if (!task) {
        return {
          content: [
            {
              type: "text",
              text: `Task with ID ${taskId} not found`,
            },
          ],
        };
      }

      task.status = 'completed';
      task.completedAt = new Date();
      await taskRepo.save(task);

      return {
        content: [
          {
            type: "text",
            text: `Task "${task.description}" marked as completed`,
          },
        ],
      };
    } catch (error) {
      console.error('Error completing task:', error);
      return {
        content: [
          {
            type: "text",
            text: "An error occurred while completing the task",
          },
        ],
      };
    }
  },
);

// Add new inventory item
server.tool(
  "add-inventory",
  "Add a new inventory item",
  {
    itemName: z.string().describe("Name of the item"),
    category: z.string().describe("Category of the item"),
    quantity: z.number().describe("Quantity of the item"),
    unit: z.string().default("units").describe("Unit of measurement"),
  },
  async ({ itemName, category, quantity, unit }) => {
    try {
      const inventory = new Inventory();
      inventory.item_name = itemName;
      inventory.category = category;
      inventory.quantity = quantity;
      inventory.unit = unit;
      inventory.last_updated = new Date();

      const savedItem = await AppDataSource.getRepository(Inventory).save(inventory);

      return {
        content: [
          {
            type: "text",
            text: `Added ${savedItem.quantity} ${savedItem.unit} of ${savedItem.item_name} to inventory`,
          },
        ],
      };
    } catch (error) {
      console.error('Error adding inventory:', error);
      return {
        content: [
          {
            type: "text",
            text: "An error occurred while adding inventory",
          },
        ],
      };
    }
  },
);

// Update inventory quantity
server.tool(
  "update-inventory",
  "Update inventory quantity",
  {
    itemId: z.string().describe("ID of the inventory item"),
    quantity: z.number().describe("New quantity"),
    action: z.enum(['set', 'add', 'subtract']).default('set').describe("Whether to set, add, or subtract the quantity"),
  },
  async ({ itemId, quantity, action }) => {
    try {
      const inventoryRepo = AppDataSource.getRepository(Inventory);
      const item = await inventoryRepo.findOneBy({ id: itemId as any });

      if (!item) {
        return {
          content: [
            {
              type: "text",
              text: `Inventory item with ID ${itemId} not found`,
            },
          ],
        };
      }

      if (action === 'add') {
        item.quantity += quantity;
      } else if (action === 'subtract') {
        item.quantity = Math.max(0, item.quantity - quantity);
      } else {
        item.quantity = quantity;
      }

      item.last_updated = new Date();
      await inventoryRepo.save(item);

      return {
        content: [
          {
            type: "text",
            text: `Updated ${item.item_name} quantity to ${item.quantity} ${item.unit}`,
          },
        ],
      };
    } catch (error) {
      console.error('Error updating inventory:', error);
      return {
        content: [
          {
            type: "text",
            text: "An error occurred while updating inventory",
          },
        ],
      };
    }
  },
);

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

      const csvContent = exportToCsv(data);
      const exportPath = path.join(__dirname, '..', 'exports', filename);

      // Ensure exports directory exists
      const exportsDir = path.join(__dirname, '..', 'exports');
      if (!require('fs').existsSync(exportsDir)) {
        require('fs').mkdirSync(exportsDir, { recursive: true });
      }

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

main();
