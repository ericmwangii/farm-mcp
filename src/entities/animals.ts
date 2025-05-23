import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("animals")
export class Animal {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    type!: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    age?: number;

    @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
    weight?: number;

    @Column({ nullable: true })
    health_status?: string;

    @Column({ type: "timestamp", nullable: true })
    last_fed?: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}