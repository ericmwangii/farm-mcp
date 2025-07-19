import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Farm } from "./farm.js";
import { User } from "./user.js";
import { SaleItem } from "./sale-item.js";


@Entity("sales")
export class Sale {
  @PrimaryGeneratedColumn('increment', { name: 'sale_id' })
  saleId!: number;

  @ManyToOne('Farm')
  @JoinColumn({ name: 'farm_id' })
  farm?: Farm;

  @Column({ name: 'farm_id', nullable: true })
  farmId?: number;

  @Column({ name: 'customer_name', length: 100, nullable: true })
  customerName?: string;

  @Column({ name: 'customer_contact', length: 100, nullable: true })
  customerContact?: string;

  @Column({ name: 'sale_date', type: 'date' })
  saleDate!: Date;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ name: 'payment_status', length: 20, default: 'pending' })
  paymentStatus!: string;

  @Column({ name: 'payment_method', length: 20, nullable: true })
  paymentMethod?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'recorded_by' })
  recordedBy?: User;

  @Column({ name: 'recorded_by', nullable: true })
  recordedById?: number;

  @OneToMany('SaleItem', 'sale')
  items!: SaleItem[];

  @Column({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt!: Date;
}
