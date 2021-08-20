import { User } from 'src/users/user.entity';
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
export class TelegramUser extends BaseEntity{
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

  @OneToOne(()=> User, user => user.telegram)
  user:User

  @CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
