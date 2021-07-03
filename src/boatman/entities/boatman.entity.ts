import { BaseEntity, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Boatman extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id:string;
  
  @CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
