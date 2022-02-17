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
@Unique(['telegramId', 'phoneNumber'])
export class TelegramClient extends BaseEntity{
  @PrimaryGeneratedColumn('uuid')
	id: string;

  @Column({nullable:false, type: "varchar", unique:true})
	telegramId:string

  @Column({nullable:false, type: "varchar", length:200})
	firstName:string

  @Column({nullable:false, type: "varchar", unique:true})
	phoneNumber:string

  @Column({nullable:false, type: "varchar", length:200})
	username:string

  @Column({nullable:false, type: "boolean"})
	isBot:boolean

  @Column({nullable:false, type: "varchar", length:200})
	languageCode:string

  @OneToOne(()=> Client, client => client.telegram)
  user:Client

  @CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
