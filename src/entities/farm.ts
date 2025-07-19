import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.js";

@Entity("farms")
export class Farm {
  @PrimaryGeneratedColumn('increment', { name: 'farm_id' })
  farmId!: number;

  @Column({ name: 'name', length: 100 })
  name!: string;

  @Column({ name: 'location', length: 255 })
  location!: string;

  @Column({ name: 'size_hectares', type: 'decimal', precision: 10, scale: 2 })
  sizeHectares!: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'established_date', type: 'date', nullable: true })
  establishedDate?: Date;

  @ManyToOne('User', 'ownedFarms')
  @JoinColumn({ name: 'owner_id' })
  owner?: User;

  @Column({ name: 'owner_id', nullable: true })
  ownerId?: number;

  @OneToMany('Inventory', 'farm')
  inventory?: any[];

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
