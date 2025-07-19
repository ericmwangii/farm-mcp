import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("harvests")
export class Harvest {
  @PrimaryGeneratedColumn({ name: 'harvest_id' })
  harvestId!: number;

  @Column({ name: 'planting_id', nullable: false })
  plantingId!: number;

  @Column({ 
    name: 'harvest_date', 
    type: 'date',
    nullable: false
  })
  harvestDate!: Date;

  @Column({ 
    name: 'quantity',
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    nullable: false
  })
  quantity!: number;

  @Column({ 
    name: 'quality_rating', 
    type: 'integer', 
    nullable: true 
  })
  qualityRating?: number;

  @Column({ 
    name: 'notes',
    type: 'text', 
    nullable: true 
  })
  notes?: string;

  @Column({ 
    name: 'recorded_by', 
    nullable: true 
  })
  recordedById?: number;

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
  @ManyToOne('Planting', 'harvests')
  @JoinColumn({ name: 'planting_id' })
  planting?: any; // Using 'any' to avoid circular dependency

  @ManyToOne('User', 'recordedHarvests')
  @JoinColumn({ name: 'recorded_by' })
  recordedBy?: any; // Using 'any' to avoid circular dependency
}
