import { Client } from 'src/clients/clients.entity';
import { Price } from 'src/prices/entities/price.entity';
import {
	Entity,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn, OneToMany, JoinColumn, ManyToOne, JoinTable, ManyToMany
} from 'typeorm'
import { Frete_Image } from '../images/frete-images.entity';
import { IState } from './types'
@Entity()
export class Frete extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

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

	@Column({nullable:true, type: "varchar", length:100, default:'Marcada'})
	state:IState

  @ManyToMany(type => Price, {eager: true})
  @JoinTable()
  prices: Price[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}