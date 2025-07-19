import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Farm } from "./farm.js";
import { User } from "./user.js";

@Entity("expenses")
export class Expense {
   @PrimaryGeneratedColumn('increment', { name: 'expense_id' })
   expenseId!: number;

   @ManyToOne('Farm')
   @JoinColumn({ name: 'farm_id' })
   farm?: Farm;

   @Column({ name: 'farm_id', nullable: true })
   farmId?: number;

   @Column({ length: 50 })
   category!: string;

   @Column({ type: 'decimal', precision: 10, scale: 2 })
   amount!: number;

   @Column({ type: 'text', nullable: true })
   description?: string;

   @Column({ type: 'date' })
   date!: Date;

   @Column({ name: 'receipt_number', length: 50, nullable: true })
   receiptNumber?: string;

   @Column({ name: 'paid_to', length: 100, nullable: true })
   paidTo?: string;

   @Column({ name: 'payment_method', length: 20, nullable: true })
   paymentMethod?: string;

   @ManyToOne('User')
   @JoinColumn({ name: 'recorded_by' })
   recordedBy?: User;

   @Column({ name: 'recorded_by', nullable: true })
   recordedById?: number;

   @Column({ 
     name: 'created_at', 
     type: 'timestamp with time zone', 
     default: () => 'CURRENT_TIMESTAMP' 
   })
   createdAt!: Date;
}
