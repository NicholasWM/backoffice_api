import { Contact } from 'src/contacts/entities/contact.entity';
import { Parking } from 'src/parking/entities/parking.entity';
import { TelegramClient } from 'src/telegram-client/entities/telegram-client.entity';
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
	OneToOne,
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
	
	@OneToMany(type => Contact, contact => contact.id)
	contacts: Contact[];

	@OneToMany(type => Parking, parking => parking)
	@JoinColumn({name:'Parkings'})
	Parkings: Parking[];
	
	@OneToOne(() => TelegramClient, telegram => telegram.user) // specify inverse side as a second parameter
	@JoinColumn()
	telegram: TelegramClient;

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