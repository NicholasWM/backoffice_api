import {
	Entity,
	Unique,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn, 
	OneToMany
} from 'typeorm'
import { Frete } from '../fretes/fretes.entity';
@Entity()
@Unique(['name'])
export class Client extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({nullable:true, type: "varchar", length:200})
	email:string

	@Column({nullable:false, type: "varchar", length:200})
	name:string

	@Column({nullable:false, type: "varchar", length:50})
	whats_app_1:string

	@Column({nullable:true, type: "varchar", length:50})
	whats_app_2:string

	@OneToMany(type => Frete, frete => frete.id)
	fretes: Frete[];
	
	// @Column({nullable:true, type: "varchar", length:50})
	// negative_cancellations:string

	// @Column({nullable:true, type: "varchar", length:50})
	// cancellations:string

	// @Column({nullable:true, type: "varchar", length:50})
	// freight:string
  
	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}