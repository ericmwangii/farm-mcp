import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  OneToMany,
  CreateDateColumn
} from "typeorm";

@Entity("plantings")
export class Planting {
  @PrimaryGeneratedColumn({ name: 'planting_id' })
  plantingId!: number;

  @Column({ name: 'field_id', nullable: false })
  fieldId!: number;

  @Column({ name: 'crop_id', nullable: false })
  cropId!: number;

  @Column({ 
    name: 'planting_date', 
    type: 'date',
    nullable: false
  })
  plantingDate!: Date;

  @Column({ 
    name: 'expected_harvest_date', 
    type: 'date', 
    nullable: true 
  })
  expectedHarvestDate?: Date;

  @Column({ 
    name: 'actual_harvest_date', 
    type: 'date', 
    nullable: true 
  })
  actualHarvestDate?: Date;

  @Column({ 
    name: 'quantity_planted', 
    type: 'integer', 
    nullable: true 
  })
  quantityPlanted?: number;

  @Column({ 
    name: 'status',
    length: 20, 
    default: 'planted',
    type: 'character varying'
  })
  status!: string;

  @Column({ 
    name: 'notes',
    type: 'text', 
    nullable: true 
  })
  notes?: string;

  @Column({ 
    name: 'created_by', 
    nullable: true 
  })
  createdById?: number;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt!: Date;

  // Relationships
  @ManyToOne('Field', 'plantings')
  @JoinColumn({ name: 'field_id' })
  field?: any; // Using 'any' to avoid circular dependency

  @ManyToOne('Crop', 'plantings')
  @JoinColumn({ name: 'crop_id' })
  crop?: any; // Using 'any' to avoid circular dependency

  @ManyToOne('User', 'createdPlantings')
  @JoinColumn({ name: 'created_by' })
  createdBy?: any; // Using 'any' to avoid circular dependency

  @OneToMany('Harvest', 'planting')
  harvests?: any[]; // Using 'any' to avoid circular dependency

   @Column({ 
     name: 'updated_at', 
     type: 'timestamp with time zone', 
     default: () => 'CURRENT_TIMESTAMP',
     onUpdate: 'CURRENT_TIMESTAMP' 
   })
   updatedAt!: Date;
}
