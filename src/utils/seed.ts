import { AppDataSource } from "../config/database.js";
import { Animal } from "../entities/animals.js";
import { Inventory } from "../entities/inventory.js";
import { Task } from "../entities/task.js";

export async function seedDatabase() {
   try {
      const animalCount = await AppDataSource.getRepository(Animal).count();
      const inventoryCount = await AppDataSource.getRepository(Inventory).count();
      const taskCount = await AppDataSource.getRepository(Task).count();

      if (animalCount === 0) {
         console.log("Seeding animals...");
         await AppDataSource.getRepository(Animal).insert([
            { type: "cow", name: "Bessie", age: 3, weight: 450.5, health_status: "healthy" },
            { type: "cow", name: "Daisy", age: 4, weight: 500.2, health_status: "healthy" },
            { type: "chicken", name: "Cluck", age: 1, weight: 2.1, health_status: "healthy" },
            { type: "pig", name: "Porky", age: 2, weight: 180.0, health_status: "healthy" }
         ]);
      }

      if (inventoryCount === 0) {
         console.log("Seeding inventory...");
         await AppDataSource.getRepository(Inventory).insert([
            { item_name: "hay", category: "feed", quantity: 500, unit: "kg" },
            { item_name: "grain", category: "feed", quantity: 200, unit: "kg" },
            { item_name: "chicken feed", category: "feed", quantity: 50, unit: "kg" },
            { item_name: "medicine", category: "supplies", quantity: 20, unit: "bottles" },
            { item_name: "tools", category: "equipment", quantity: 15, unit: "pieces" }
         ]);
      }

      if (taskCount === 0) {
         console.log("Seeding tasks...");
         const now = new Date();
         const tomorrow = new Date(now);
         tomorrow.setDate(tomorrow.getDate() + 1);

         const nextWeek = new Date(now);
         nextWeek.setDate(nextWeek.getDate() + 7);

         await AppDataSource.getRepository(Task).insert([
            {
               description: "Feed the cows in the morning",
               dueDate: tomorrow,
               priority: "high",
               status: "pending"
            },
            {
               description: "Clean the chicken coop",
               dueDate: nextWeek,
               priority: "medium",
               status: "pending"
            },
            {
               description: "Check water supply in all pens",
               dueDate: now,
               priority: "high",
               status: "pending"
            },
            {
               description: "Order more grain supply",
               dueDate: nextWeek,
               priority: "medium",
               status: "pending"
            },
            {
               description: "Schedule vet visit for annual checkup",
               dueDate: new Date(now.setMonth(now.getMonth() + 1)),
               priority: "low",
               status: "pending"
            },
            {
               description: "Harvest eggs",
               dueDate: now,
               priority: "high",
               status: "completed",
               completedAt: new Date()
            }
         ]);
      }

      console.log("Database seeding completed");
   } catch (error) {
      console.error("Error seeding database:", error);
   }
}
