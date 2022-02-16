import {
	Entity,
	Unique,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn, OneToMany, JoinColumn, OneToOne
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User_Image } from '../images/user-images.entity';
import { TelegramUser } from 'src/telegram-user/entities/telegram-user.entity';
@Entity()
@Unique(['email', 'username'])
export class User extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({nullable:false, type: "varchar", length:200})
	email:string

	@Column({nullable:false, type: "varchar", length:200})
	name:string

	@Column({nullable:true, type: "varchar", length:200})
	username:string

	@Column({nullable:false})
	password:string

	@Column({nullable:false, type: "varchar", length:20})
	role: string

	@OneToMany(type => User_Image, user_image => user_image.id)
	images: User_Image[];

	@Column({nullable:false, default:true})
	status: boolean;

	@OneToOne(() => TelegramUser, telegram => telegram.user.id) // specify inverse side as a second parameter
	@JoinColumn()
	telegram: TelegramUser;

	@Column({nullable: false})
	salt: string;

	@Column({nullable: true, type:"varchar", length:64})
	confirmationToken: string;

	@Column({nullable: true, type:"varchar", length:64})
	recoverToken: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	async checkPassword(password:string):Promise<boolean>{
		const hash = await bcrypt.hash(password, this.salt);
		return hash === this.password
	}
}