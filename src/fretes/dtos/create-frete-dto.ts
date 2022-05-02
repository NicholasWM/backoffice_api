import { IsArray, IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { IState } from '../types';

export class CreateFreteDTO {
	@IsNotEmpty()
	@ApiProperty({
		description: "4daa9f36-accd-49d1-8550-41e43f31520d",
	})
	clientId: string;

	@ApiProperty({
		description: "4daa9f36-accd-49d1-8550-41e43f31520d",
		default: 1
	})
	boatmanId?: string;

	@ApiProperty({
		description: "Array of ids/uuids of the prices"
	})
	prices: Array<string>;

	@IsNotEmpty()
	@ApiProperty({
		description: "2021/11/27",
	})
	date: Date;

	@ApiProperty()
	customPrice: number;

	@ApiProperty({
		default: 'Marcada'
	})
	state?: IState;
}