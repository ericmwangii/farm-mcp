import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("feeding_records")
export class FeedingRecord {
   @PrimaryGeneratedColumn()
   id!: number;

   @Column({ nullable: true })
   animal_type?: string;

   @Column({ nullable: true })
   feed_type?: string;

   @Column({ type: "decimal", precision: 10, scale: 2 })
   quantity!: number;

   @Column({ nullable: true })
   unit?: string;

   @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
   timestamp!: Date;

   @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
   created_at!: Date;

   @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
   updated_at!: Date;
}