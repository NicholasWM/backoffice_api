import { Client } from 'src/clients/clients.entity';
import { Parking_Image } from 'src/images/parking-images.entity';
import {
	Entity,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn, 
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { period, status } from '../types';

@Entity()
export class Parking extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({nullable:false, type: "varchar"})
	clientId: string;

	@ManyToOne(type => Client, client => client.id, {nullable:false})
	@JoinColumn()
  client: Client;

	@Column({nullable:true, type: "varchar", default:'daytime'})
	period: period

	@Column({nullable:true, type: "varchar"})
	color: string

	@Column({nullable:true, type: "varchar"})
	plate: string

	@Column({nullable:true, type: "varchar"})
	model: string

	@Column({nullable:true, type: "numeric"})
	price: Number

	@Column({type: "boolean", default: false})
	hasSecret: boolean

	@Column({nullable:true, type: "varchar", length:100})
	timeCourse: string

	@Column({nullable:true, type: "varchar", length:100, default: 'Estacionado'})
	status: status

	@OneToMany(type => Parking_Image, parking_image => parking_image.id)
	images: Parking_Image[];

  @CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}