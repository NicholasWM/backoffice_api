import { Contact } from 'src/contacts/entities/contact.entity';
import {
	Entity,
	Unique,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn, 
	OneToMany,
	JoinColumn,
	JoinTable,
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

	@OneToMany(type => Frete, frete => frete.id)
	fretes: Frete[];
	
	@OneToMany(type => Contact, contact => contact)
	@JoinColumn({name:'contacts'})
	contacts: Contact[];
	
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