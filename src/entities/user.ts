import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn, 
  OneToMany,
  Index 
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole as UserRoleEntity } from "./user-role.js";
import { UserRole } from "../types/user-roles.js";
import { UserSession } from "./user-session.js";
import { TaskAssignment } from "./task-assignment.js";
import { TaskComment } from "./task-comment.js";
import { Activity } from "./activity.js";
import { Expense } from "./expense.js";
import { Harvest } from "./harvest.js";
import { Sale } from "./sale.js";
import { Farm } from "./farm.js";

@Entity("users")
@Index("users_email_key", ["email"], { unique: true })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'first_name', length: 50, nullable: false })
  firstName!: string;

  @Column({ name: 'last_name', length: 50, nullable: false })
  lastName!: string;

  @Column({ name: 'email', length: 100, nullable: false })
  email!: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'password_hash', length: 255, nullable: false })
  private _passwordHash!: string;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt!: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt!: Date;

  @ManyToOne(() => UserRoleEntity, role => role.users, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'role_id' })
  roleEntity!: UserRoleEntity;

  @Column({ name: 'role_id', nullable: true })
  roleId?: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'last_login', type: 'timestamp with time zone', nullable: true })
  lastLogin?: Date;

  @Column({ name: 'hire_date', type: 'date', nullable: true })
  hireDate?: Date;

  // Relations
  @OneToMany(() => UserSession, session => session.user)
  sessions!: UserSession[];

  @OneToMany(() => TaskAssignment, assignment => assignment.user)
  taskAssignments!: TaskAssignment[];

  @OneToMany(() => TaskComment, comment => comment.user)
  taskComments!: TaskComment[];

  @OneToMany(() => Activity, activity => activity.assignedTo)
  assignedActivities!: Activity[];

  @OneToMany(() => Activity, activity => activity.createdBy)
  createdActivities!: Activity[];

  @OneToMany(() => Expense, expense => expense.recordedBy)
  recordedExpenses!: Expense[];

  @OneToMany(() => Harvest, harvest => harvest.recordedBy)
  recordedHarvests!: Harvest[];

  @OneToMany(() => Sale, sale => sale.recordedBy)
  recordedSales!: Sale[];

  @OneToMany(() => Farm, farm => farm.owner)
  ownedFarms!: Farm[];

  // For backward compatibility
  get id(): number {
    return this.userId;
  }

  set id(value: number) {
    this.userId = value;
  }

  // Password handling
  async setPassword(password: string): Promise<void> {
    this._passwordHash = await bcrypt.hash(password, 10);
  }

  async checkPassword(password: string): Promise<boolean> {
    if (!this._passwordHash) return false;
    return await bcrypt.compare(password, this._passwordHash);
  }

  // For backward compatibility
  get passwordHash(): string {
    return this._passwordHash;
  }

  set passwordHash(hash: string) {
    this._passwordHash = hash;
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }
}
