import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn,
  OneToMany
} from "typeorm";
import { Field } from "./field.js";

@Entity("activities")
export class Activity {
  @PrimaryGeneratedColumn('increment', { name: 'activity_id' })
  activityId!: number;

  @Column({ name: 'farm_id', nullable: true })
  farmId?: number;

  @Column({ name: 'activity_type', length: 50, nullable: false })
  activityType!: string;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ name: 'start_date', type: 'timestamp with time zone', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone', nullable: true })
  endDate?: Date;

  @Column({ 
    name: 'status', 
    length: 20, 
    default: 'planned',
    type: 'character varying'
  })
  status!: string;

  @Column({ name: 'assigned_to', nullable: true })
  assignedToId?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_by', nullable: true })
  createdById?: number;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt!: Date;

  // Relationships
  @ManyToOne('Farm', 'activities')
  @JoinColumn({ name: 'farm_id' })
  farm?: any; // Using 'any' to avoid circular dependency

  @ManyToOne('User', 'assignedActivities')
  @JoinColumn({ name: 'assigned_to' })
  assignedTo?: any; // Using 'any' to avoid circular dependency

  @ManyToOne('User', 'createdActivities')
  @JoinColumn({ name: 'created_by' })
  createdBy?: any; // Using 'any' to avoid circular dependency

  @OneToMany('ActivityField', 'activity')
  activityFields?: any[]; // Using 'any' to avoid circular dependency
}
