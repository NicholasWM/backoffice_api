import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { period, status } from '../types';

export class UpdateParkingDto {
	@IsNotEmpty()
	@ApiProperty({
		description:"4daa9f36-accd-49d1-8550-41e43f31520d",
	})
	id: string;

	@ApiProperty()
  period:period;

	@ApiProperty()
  color:string;

	@ApiProperty()
  plate:string;

	@ApiProperty()
  model:string;

	@ApiProperty()
  price:number;

	@ApiProperty()
  hasSecret:boolean;

	@ApiProperty()
  timeCourse:string;

	@ApiProperty()
  status:status;
}