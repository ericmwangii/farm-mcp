import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn, 
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("fields")
export class Field {
  @PrimaryGeneratedColumn({ name: 'field_id' })
  fieldId!: number;

  @Column({ name: 'farm_id', nullable: false })
  farmId!: number;

  @Column({ 
    name: 'name', 
    length: 100,
    nullable: false
  })
  name!: string;

  @Column({ 
    name: 'size_hectares', 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    nullable: false
  })
  sizeHectares!: number;

  @Column({ 
    name: 'soil_type', 
    length: 50, 
    nullable: true 
  })
  soilType?: string;

  @Column({ 
    name: 'gps_coordinates', 
    type: 'point', 
    nullable: true 
  })
  gpsCoordinates?: string;

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
  @ManyToOne('Farm', 'fields')
  @JoinColumn({ name: 'farm_id' })
  farm?: any; // Using 'any' to avoid circular dependency

  @OneToMany('Planting', 'field')
  plantings?: any[]; // Using 'any' to avoid circular dependency

  @OneToMany('ActivityFields', 'field')
  activityFields?: any[]; // Using 'any' to avoid circular dependency
}
