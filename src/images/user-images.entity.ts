import { User } from 'src/users/user.entity';
import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
		ManyToOne,
		JoinColumn,
		Unique
} from 'typeorm'
@Entity()
@Unique(['name'])
export class User_Image extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({nullable:true, type: "varchar"})
	name: string;

	@Column({nullable:true, type: "varchar"})
	dirname: string;
	
	@Column({nullable:false, type: "varchar"})
	userId: string;

	@ManyToOne(type => User, user => user.images, {nullable:false})
	@JoinColumn({ name: "userId" })
  user: User;
  
	@CreateDateColumn()
	createdAt: Date;
}