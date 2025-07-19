import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Sale } from "./sale.js";

@Entity("sale_items")
export class SaleItem {
   @PrimaryGeneratedColumn('increment', { name: 'sale_item_id' })
   saleItemId!: number;

   @ManyToOne('Sale', 'items')
   @JoinColumn({ name: 'sale_id' })
   sale!: Sale;

   @Column({ name: 'sale_id' })
   saleId!: number;

   @Column({ name: 'item_type', length: 20 })
   itemType!: string;

   @Column({ name: 'item_id' })
   itemId!: number;

   @Column({ type: 'text' })
   description!: string;

   @Column({ type: 'decimal', precision: 10, scale: 2 })
   quantity!: number;

   @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
   unitPrice!: number;

   @Column({ 
     name: 'total_price', 
     type: 'decimal', 
     precision: 10, 
     scale: 2,
     generatedType: 'STORED',
     asExpression: '(quantity * unit_price)'
   })
   totalPrice!: number;
}
