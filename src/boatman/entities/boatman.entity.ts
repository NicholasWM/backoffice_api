import { Frete } from "src/fretes/fretes.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Boatman extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id:number;
  
	@Column({nullable:false, type: "varchar"})
	name: String
  
	@OneToMany(type => Frete, frete => frete.id)
	fretes: Frete[];

  @CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
