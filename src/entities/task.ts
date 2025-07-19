import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from "typeorm";

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Represents a task entity.
 */
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn({ name: 'task_id' })
  taskId!: number;

  @Column({ 
    name: 'title', 
    type: 'character varying',
    length: 200,
    nullable: false
  })
  title!: string;

  @Column({ 
    name: 'status',
    type: 'character varying',
    length: 20,
    nullable: false,
    default: 'pending'
  })
  status!: TaskStatus;

  @Column({ 
    name: 'description',
    type: 'text', 
    nullable: true 
  })
  description?: string;

  @Column({ 
    name: 'priority',
    type: 'character varying',
    length: 10, 
    nullable: true 
  })
  priority?: TaskPriority;

  @Column({ 
    name: 'due_date', 
    type: 'timestamp with time zone', 
    nullable: true 
  })
  dueDate?: Date;

  @Column({ 
    name: 'completed_at', 
    type: 'timestamp with time zone', 
    nullable: true 
  })
  completedAt?: Date;

  @Column({ 
    name: 'start_date', 
    type: 'timestamp with time zone', 
    nullable: true 
  })
  startDate?: Date;

  @Column({ 
    name: 'end_date', 
    type: 'timestamp with time zone', 
    nullable: true 
  })
  endDate?: Date;

  @Column({ name: 'created_by', nullable: false })
  createdById!: number;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt!: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt!: Date;

  // Relationships
  @ManyToOne('User', 'createdTasks')
  @JoinColumn({ name: 'created_by' })
  createdBy?: any; // Using 'any' to avoid circular dependency

  @OneToMany('TaskAssignment', 'task')
  assignments?: any[]; // Using 'any' to avoid circular dependency

  @OneToMany('TaskComment', 'task')
  comments?: any[]; // Using 'any' to avoid circular dependency

  @OneToMany('TaskAttachment', 'task')
  attachments?: any[]; // Using 'any' to avoid circular dependency

  /**
   * Creates a new task with the given parameters.
   * @param title - The title of the task.
   * @param createdById - The ID of the user who created the task.
   * @param description - Optional description of the task.
   * @param priority - Optional priority of the task.
   * @param dueDate - Optional due date of the task.
   * @returns A new Task instance.
   */
  static createTask(
    title: string,
    createdById: number,
    description?: string,
    priority?: TaskPriority,
    dueDate?: Date
  ): Task {
    const task = new Task();
    task.title = title;
    task.createdById = createdById;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    task.status = 'pending';
    return task;
  }

  /**
   * Marks the task as completed.
   * @param completedAt - The date when the task was completed. Defaults to the current date.
   */
  complete(completedAt: Date = new Date()): void {
    this.status = 'completed';
    this.completedAt = completedAt;
    this.endDate = completedAt;
  }

  /**
   * Updates the task status.
   * @param status - The new status of the task.
   * @param updatedById - The ID of the user who is updating the task.
   */
  updateStatus(status: TaskStatus): void {
    this.status = status;
    
    if (status === 'completed') {
      this.complete();
    } else if (status === 'in_progress' && !this.startDate) {
      this.startDate = new Date();
    }
  }

  /**
   * Updates the task with the provided data.
   * @param data - The data to update the task with.
   * @returns The updated task.
   */
  update(data: Partial<Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>>): Task {
    Object.assign(this, {
      ...data,
      updatedAt: new Date()
    });
    
    return this;
  }
}
