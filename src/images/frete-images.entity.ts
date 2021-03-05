import { Frete } from 'src/fretes/fretes.entity';
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
export class Frete_Image extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({nullable:true, type: "varchar"})
	name: string;

	@Column({nullable:false, type: "varchar"})
	freteId: string;

	@ManyToOne(type => Frete, frete => frete.images, {nullable:false})
	@JoinColumn({ name: "freteId" })
  frete: Frete;
  
	@CreateDateColumn()
	createdAt: Date;
}