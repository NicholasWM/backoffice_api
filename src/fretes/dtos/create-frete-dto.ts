import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class CreateFreteDTO {
	@IsNotEmpty()
	@ApiProperty({
		description:"4daa9f36-accd-49d1-8550-41e43f31520d",
	})
	clientId: string;

	@IsNotEmpty()
	@ApiProperty({
		description: "Array of ids of the prices"
	})
	prices: Array<string>;

	@IsNotEmpty()
	@ApiProperty({
		description:"2021/11/27",
	})
  date:Date;
}