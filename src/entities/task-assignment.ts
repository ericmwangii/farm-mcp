import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

export type TaskAssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Represents the assignment of a task to a user.
 */
@Entity("task_assignments")
export class TaskAssignment {
  @PrimaryGeneratedColumn({ name: 'assignment_id' })
  assignmentId!: number;

  @Column({ name: 'task_id', nullable: false })
  taskId!: number;

  @Column({ name: 'user_id', nullable: false })
  userId!: number;

  @Column({ name: 'assigned_by', nullable: false })
  assignedById!: number;

  @CreateDateColumn({ 
    name: 'assigned_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  assignedAt!: Date;

  @Column({ 
    name: 'status',
    type: 'character varying',
    length: 20,
    default: 'assigned',
    nullable: false
  })
  status!: TaskAssignmentStatus;

  @Column({ 
    name: 'completed_at', 
    type: 'timestamp with time zone', 
    nullable: true 
  })
  completedAt?: Date;

  @Column({ 
    name: 'notes',
    type: 'text', 
    nullable: true 
  })
  notes?: string;

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
  @ManyToOne('Task', 'assignments')
  @JoinColumn({ name: 'task_id' })
  task?: any; // Using 'any' to avoid circular dependency

  @ManyToOne('User', 'assignedTasks')
  @JoinColumn({ name: 'user_id' })
  user?: any; // Using 'any' to avoid circular dependency

  @ManyToOne('User', 'assignedTasksToOthers')
  @JoinColumn({ name: 'assigned_by' })
  assignedBy?: any; // Using 'any' to avoid circular dependency
}
