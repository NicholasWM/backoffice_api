import {IsEmail, IsNotEmpty, MaxLength, IsPhoneNumber} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { IContact } from '../types';

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

  @ApiProperty({
		default: [{
			desc:  'WhatsApp',
			info:  '13999999',
			clientID: ''
		}]
	})
	contacts: Array<IContact>;

}