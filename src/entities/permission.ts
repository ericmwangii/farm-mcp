import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { RolePermission } from "./role-permission.js";
// Using type-only import to prevent circular dependency

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn('increment', { name: 'permission_id' })
  permissionId!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany('RolePermission', 'permission')
  rolePermissions!: RolePermission[];

  @Column({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt!: Date;
}
