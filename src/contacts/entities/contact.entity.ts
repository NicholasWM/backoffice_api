import { Client } from 'src/clients/clients.entity';
import {
	Entity,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn, 
  JoinColumn,
  ManyToOne,
} from 'typeorm'

@Entity()
export class Contact extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({nullable:true, type: "varchar", length:200})
	description:string

	@Column({nullable:false, type: "varchar", length:200})
	info:string

	@Column({nullable:false, type: "boolean"})
	status:boolean

	@Column({nullable:false, type: "varchar"})
	clientId: string;

	@ManyToOne(type => Client, client => client.contacts, {nullable:false})
	@JoinColumn()
  	client: Client;

  @CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}