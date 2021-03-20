import { Frete } from 'src/fretes/fretes.entity';
import {
	Entity,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Price extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({nullable:true, type: "varchar", length:200})
	description:string

	@Column({nullable:false, type: "smallint"})
	value:Number

	@Column({nullable:false, type: "boolean"})
	status:Boolean

  @CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}