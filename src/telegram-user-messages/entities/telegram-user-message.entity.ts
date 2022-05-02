import { TelegramUser } from 'src/telegram-user/entities/telegram-user.entity';
import {
	Entity,
	Unique,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	ManyToOne
} from 'typeorm'

@Entity()
@Unique(['message_id'])
export class TelegramUserMessage extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: true, type: "varchar", unique: true })
	message_id: number

	@Column({ nullable: true, type: "varchar" })
	chat_id: number

	@Column({ nullable: true, type: "varchar", length: 500 })
	text: string

	@Column({ nullable: true, type: "varchar", length: 200 })
	updateSubType: string

	@ManyToOne(type => TelegramUser, TelegramUser => TelegramUser.messages, { nullable: false })
	@JoinColumn({ name: "telegramUserId" })
	telegramUser: TelegramUser;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
