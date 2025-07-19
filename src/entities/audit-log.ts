import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.js";

@Entity("audit_log")
export class AuditLog {
   @PrimaryGeneratedColumn('increment', { name: 'log_id' })
   logId!: number;

   @ManyToOne('User')
   @JoinColumn({ name: 'user_id' })
   user?: User;

   @Column({ name: 'user_id', nullable: true })
   userId?: number;

   @Column({ name: 'action', length: 50 })
   action!: string;

   @Column({ name: 'table_name', length: 50 })
   tableName!: string;

   @Column({ name: 'record_id', nullable: true })
   recordId?: number;

   @Column({ name: 'old_values', type: 'jsonb', nullable: true })
   oldValues?: any;

   @Column({ name: 'new_values', type: 'jsonb', nullable: true })
   newValues?: any;

   @Column({ name: 'ip_address', type: 'inet', nullable: true })
   ipAddress?: string;

   @Column({ name: 'user_agent', type: 'text', nullable: true })
   userAgent?: string;

   @Column({ 
     name: 'created_at', 
     type: 'timestamp with time zone', 
     default: () => 'CURRENT_TIMESTAMP' 
   })
   createdAt!: Date;
}
