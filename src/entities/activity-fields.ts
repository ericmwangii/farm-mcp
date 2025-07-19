import { 
  Entity, 
  PrimaryColumn, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn 
} from "typeorm";

@Entity("activity_fields")
export class ActivityFields {
  @PrimaryColumn({ 
    name: 'activity_id',
    type: 'integer'
  })
  activityId!: number;

  @PrimaryColumn({ 
    name: 'field_id',
    type: 'integer'
  })
  fieldId!: number;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt!: Date;

  // Relationships
  @ManyToOne('Activity', 'activityFields')
  @JoinColumn({ name: 'activity_id' })
  activity?: any; // Using 'any' to avoid circular dependency

  @ManyToOne('Field', 'activityFields')
  @JoinColumn({ name: 'field_id' })
  field?: any; // Using 'any' to avoid circular dependency
}
