import { Parking } from 'src/parking/entities/parking.entity';
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
export class Parking_Image extends BaseEntity{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({nullable:true, type: "varchar"})
	name: string;

	@Column({nullable:false, type: "varchar"})
	parkingId: string;

	@Column({nullable:false, type: "varchar"})
	dirname: string;

	@ManyToOne(type => Parking, parking => parking.images, {nullable:false})
	@JoinColumn({ name: "parkingId" })
  parking: Parking;
  
	@CreateDateColumn()
	createdAt: Date;
}