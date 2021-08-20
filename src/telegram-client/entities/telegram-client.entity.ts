import { Client } from 'src/clients/clients.entity';
import {
	Entity,
	Unique,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn, OneToMany, OneToOne, JoinColumn
} from 'typeorm'

@Entity()
@Unique(['telegramId', 'phoneNumber', 'username'])
export class TelegramClient extends BaseEntity{
  @PrimaryGeneratedColumn('uuid')
	id: string;

  @Column({nullable:false, type: "varchar", unique:true})
	telegramId:string

  @Column({nullable:false, type: "varchar", length:200})
	firstname:string

  @Column({nullable:false, type: "varchar", unique:true})
	phoneNumber:string

  @Column({nullable:false, type: "varchar", length:200, unique:true})
	username:string

  @Column({nullable:false, type: "boolean"})
	is_bot:boolean

  @Column({nullable:false, type: "varchar", length:200})
	language_code:string

  @OneToOne(()=> Client, client => client.telegram)
  user:Client

  @CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
