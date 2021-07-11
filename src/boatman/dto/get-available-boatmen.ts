import {  IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class GetAvailableBoatmenDTO {
  @IsNotEmpty()
	@ApiProperty({
		description:"2021/08/08",
		default:"2021/08/08",
	})
	date: string;
}