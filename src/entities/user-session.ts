import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.js";

@Entity("user_sessions")
export class UserSession {
   @PrimaryGeneratedColumn('uuid', { name: 'session_id' })
   sessionId!: string;

   @ManyToOne('User')
   @JoinColumn({ name: 'user_id' })
   user!: User;

   @Column({ name: 'user_id' })
   userId!: number;

   @Column({ name: 'ip_address', type: 'inet', nullable: true })
   ipAddress?: string;

   @Column({ name: 'user_agent', type: 'text', nullable: true })
   userAgent?: string;

   @Column({ name: 'refresh_token', type: 'text' })
   refreshToken!: string;

   @Column({ name: 'expires_at', type: 'timestamp with time zone' })
   expiresAt!: Date;

   @Column({ name: 'is_revoked', default: false })
   isRevoked!: boolean;

   @Column({ 
     name: 'created_at', 
     type: 'timestamp with time zone', 
     default: () => 'CURRENT_TIMESTAMP' 
   })
   createdAt!: Date;

   @Column({ 
     name: 'updated_at', 
     type: 'timestamp with time zone', 
     default: () => 'CURRENT_TIMESTAMP',
     onUpdate: 'CURRENT_TIMESTAMP' 
   })
   updatedAt!: Date;
}
