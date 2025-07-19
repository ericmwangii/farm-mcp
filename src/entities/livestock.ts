import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany } from "typeorm";
import { Farm } from "./farm.js";

@Entity("livestock")
export class Livestock {
   @PrimaryGeneratedColumn('increment', { name: 'animal_id' })
   animalId!: number;

   @ManyToOne('Farm', 'livestock')
   @JoinColumn({ name: 'farm_id' })
   farm!: Farm;

   @Column({ name: 'farm_id' })
   farmId!: number;

   @Column({ name: 'tag_number', length: 50, unique: true })
   tagNumber!: string;

   @Column({ length: 50 })
   species!: string;

   @Column({ length: 50, nullable: true })
   breed?: string;

   @Column({ length: 10, nullable: true })
   sex?: string;

   @Column({ name: 'birth_date', type: 'date', nullable: true })
   birthDate?: Date;

   @ManyToOne('Livestock')
   @JoinColumn({ name: 'parent_male_id' })
   parentMale?: Livestock;

   @Column({ name: 'parent_male_id', nullable: true })
   parentMaleId?: number;

   @ManyToOne('Livestock')
   @JoinColumn({ name: 'parent_female_id' })
   parentFemale?: Livestock;

   @Column({ name: 'parent_female_id', nullable: true })
   parentFemaleId?: number;

   @Column({ name: 'purchase_date', type: 'date', nullable: true })
   purchaseDate?: Date;

   @Column({ name: 'purchase_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
   purchasePrice?: number;

   @Column({ length: 20, default: 'active' })
   status!: string;

   @Column({ type: 'text', nullable: true })
   notes?: string;

   @OneToMany('Livestock', 'parentMale')
   childrenMale?: Livestock[];

   @OneToMany('Livestock', 'parentFemale')
   childrenFemale?: Livestock[];

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
