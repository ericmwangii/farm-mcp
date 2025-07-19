import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "./user.js";
import { RolePermission } from "./role-permission.js";

@Entity("user_roles")
export class UserRole {
   @PrimaryGeneratedColumn('increment', { name: 'role_id' })
   roleId!: number;

   @Column({ length: 50, unique: true })
   name!: string;

   @Column({ type: 'text', nullable: true })
   description?: string;

   @Column({ name: 'is_system', default: false })
   isSystem!: boolean;

   @OneToMany('User', 'role')
   users!: User[];

   @OneToMany('RolePermission', 'role')
   rolePermissions!: RolePermission[];

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
