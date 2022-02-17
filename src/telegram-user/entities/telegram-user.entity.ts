import { TelegramUserMessage } from 'src/telegram-user-messages/entities/telegram-user-message.entity';
import { User } from 'src/users/user.entity';
import {
	Entity,
	Unique,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn, OneToMany, OneToOne, JoinColumn, ManyToOne
} from 'typeorm'

@Entity()
@Unique(['telegram_id', 'phone_number'])
export class TelegramUser extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: true, type: "varchar", unique: true })
	telegram_id: number

	@Column({ nullable: true, type: "varchar", length: 200 })
	first_name: string

	@Column({ nullable: true, type: "varchar", length: 200 })
	last_name: string

	@Column({ nullable: true, type: "varchar", unique: true })
	phone_number: string

	@Column({ nullable: true, type: "varchar", length: 200, unique: true })
	username: string

	@Column({ nullable: true, type: "boolean" })
	is_bot: boolean

	@Column({ nullable: true, type: "varchar", length: 200 })
	language_code: string

	@OneToOne(() => User, user => user.telegram.id)
	@JoinColumn()
	user: User
	
	@OneToMany(type => TelegramUserMessage, TelegramUserMessage => TelegramUserMessage.id)
	messages: TelegramUserMessage[];
	
  @CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
