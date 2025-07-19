import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany 
} from "typeorm";

@Entity("crops")
export class Crop {
  @PrimaryGeneratedColumn({ name: 'crop_id' })
  cropId!: number;

  @Column({ 
    name: 'name', 
    length: 100, 
    nullable: false 
  })
  name!: string;

  @Column({ 
    name: 'variety', 
    length: 100, 
    nullable: true 
  })
  variety?: string;

  @Column({ 
    name: 'scientific_name', 
    length: 100, 
    nullable: true 
  })
  scientificName?: string;

  @Column({ 
    name: 'description', 
    type: 'text', 
    nullable: true 
  })
  description?: string;

  @Column({ 
    name: 'growth_days', 
    type: 'integer', 
    nullable: true 
  })
  growthDays?: number;

  @Column({ 
    name: 'water_requirements', 
    length: 50, 
    nullable: true 
  })
  waterRequirements?: string;

  // Relationships
  @OneToMany('Planting', 'crop')
  plantings?: any[]; // Using any[] to break circular dependency

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
}
