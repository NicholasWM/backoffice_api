import {
	Entity,
	Unique,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn, OneToMany
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User_Image } from '../images/user-images.entity';
@Entity()
@Unique(['email', 'username'])
export class User extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({nullable:false, type: "varchar", length:200})
	email:string

	@Column({nullable:true, type: "bytea"})
	photo: Buffer

	@Column({nullable:true, type: "varchar"})
	photoURI: string

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