import {IsEmail, IsNotEmpty, MaxLength, IsPhoneNumber} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDTO {
	@IsNotEmpty({
		message: 'Informe um endereço de email',
	})
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
		message: 'Informe o nome do usuario'
	})
	@MaxLength(200,{
		message: 'O nome do usuario deve ter menos de 200 caracteres',
	})
	@ApiProperty({
		default:'Abc Client',
	})
	name: string;

  
	@IsNotEmpty({
		message: 'Informe o numero do usuario'
	})
	@MaxLength(30,{
		message: 'O numero do Cliente deve ter menos de 30 caracteres',
	})
  @IsPhoneNumber('BR')
	@ApiProperty({
		default:'13999999999',
	})
	whats_app_1: string;

	@ApiProperty({
		default:'13999999999',
	})
	whats_app_2: string;
}