import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class CreateFreteDTO {
	@IsEmail({},{
		message: 'Informe um endereço de email válido'
	})
	@MaxLength(200,{
		message: 'O endereço de email deve ter pelo menos 200 caracteres',
	})
	@ApiProperty({
		default:'abc@abc.com',
		description:'User email'
	})
	email: string;

	@IsNotEmpty({
		message: 'Informe o id do Cliente'
	})
	@ApiProperty({
		default:1,
	})
	clientId: string;

	@ApiProperty({
		default:1,
	})
	price: Number;

	@ApiProperty({
		default:1,
	})
  date:Date;
}