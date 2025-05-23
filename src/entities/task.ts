import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  EntityManager 
} from "typeorm";

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed' | 'cancelled';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'timestamp with time zone' })
    dueDate!: Date;

    @Column({ 
        type: 'enum',
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    })
    priority: TaskPriority = 'medium';

    @Column({ 
        type: 'enum',
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    })
    status: TaskStatus = 'pending';

    @Column({ type: 'varchar', nullable: true })
    repeatPattern: string | null = null;

    @Column({ type: 'timestamp with time zone', nullable: true })
    completedAt: Date | null = null;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt!: Date;

    // Factory method to create a new task
    static createTask(description: string, dueDate: Date, priority: TaskPriority = 'medium'): Task {
        const task = new Task();
        task.description = description;
        task.dueDate = dueDate;
        task.priority = priority;
        return task;
    }

    // Helper method to mark task as complete
    complete(manager?: EntityManager) {
        this.status = 'completed';
        this.completedAt = new Date();
        
        if (manager) {
            return manager.save(this);
        }
        return this;
    }

    // Helper method to cancel task
    cancel(manager?: EntityManager) {
        this.status = 'cancelled';
        
        if (manager) {
            return manager.save(this);
        }
        return this;
    }

    // Helper method to update task
    update(data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>, manager?: EntityManager) {
        Object.assign(this, {
            ...data,
            updatedAt: new Date()
        });
        
        if (manager) {
            return manager.save(this);
        }
        return this;
    }
}
