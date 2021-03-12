import { Client } from 'src/clients/clients.entity';
import {
	Entity,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn, OneToMany, JoinColumn, ManyToOne
} from 'typeorm'
type IState = ['Marcada', 'Cancelada', 'Adiada', 'Confirmada']
import { Frete_Image } from '../images/frete-images.entity';
@Entity()
export class Frete extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({nullable:true, type: "varchar", length:200})
	email:string

	@Column({nullable:false, type: "numeric"})
	price:Number

	@Column({nullable:true, type: "numeric"})
	deposit_returned: Number

	@Column({nullable:false, type: "timestamp"})
	date:Date
  
	@Column({nullable:true, type: "timestamp"})
	postponed_frete:Date
  
	@OneToMany(type => Frete_Image, frete_image => frete_image.id)
	images: Frete_Image[];
  
	@Column({nullable:false, type: "varchar"})
	clientId: string;

	@ManyToOne(type => Client, client => client.id, {nullable:false})
	@JoinColumn({ name: "clientId" })
  client: Client;

	@Column({nullable:true, type: "varchar", length:100})
	state:IState

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}