import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Farm } from "./farm.js";

@Entity("inventory")
export class Inventory {
   @PrimaryGeneratedColumn('increment', { name: 'item_id' })
   itemId!: number;

   @ManyToOne(() => Farm, farm => farm.inventory, { nullable: true })
   @JoinColumn({ name: 'farm_id' })
   farm?: Farm;

   @Column({ name: 'farm_id', nullable: true })
   farmId?: number;

   @Column({ name: 'name', length: 100 })
   name!: string;

   @Column({ name: 'category', length: 50 })
   category!: string;

   @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2 })
   quantity!: number;

   @Column({ name: 'unit', length: 20 })
   unit!: string;

   @Column({ name: 'min_quantity', type: 'decimal', precision: 10, scale: 2, nullable: true })
   minQuantity?: number;

   @Column({ name: 'supplier', length: 100, nullable: true })
   supplier?: string;

   @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
   unitCost?: number;

   @Column({ name: 'expiry_date', type: 'date', nullable: true })
   expiryDate?: Date;

   @Column({ name: 'notes', type: 'text', nullable: true })
   notes?: string;

   @Column({
      name: 'last_updated',
      type: 'timestamp with time zone',
      default: () => 'CURRENT_TIMESTAMP'
   })
   lastUpdated!: Date;

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

