import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class CreateBoatmanDto {
	@ApiProperty({
		description:"Fabiano",
		default: "Fabiano"
	})
	name: string;
}