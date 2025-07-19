import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from "typeorm";

import { Permission } from "./permission.js";
import { UserRole } from "./user-role.js";

@Entity("role_permissions")
export class RolePermission {
  @PrimaryColumn({ name: 'role_id' })
  roleId!: number;

  @ManyToOne('UserRole', 'rolePermissions')
  @JoinColumn({ name: 'role_id' })
  role!: UserRole;

  @PrimaryColumn({ name: 'permission_id' })
  permissionId!: number;

  @ManyToOne('Permission', 'rolePermissions')
  @JoinColumn({ name: 'permission_id' })
  permission!: Permission;

  @Column({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt!: Date;
}
