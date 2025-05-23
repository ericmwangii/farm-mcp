import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("inventory")
export class Inventory {
   @PrimaryGeneratedColumn()
   id!: number;

   @Column()
   item_name!: string;

   @Column({ nullable: true })
   category?: string;

   @Column({ type: "decimal", precision: 10, scale: 2 })
   quantity!: number;

   @Column({ nullable: true })
   unit?: string;

   @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
   last_updated!: Date;


   @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
   created_at!: Date;

   @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
   updated_at!: Date;
}