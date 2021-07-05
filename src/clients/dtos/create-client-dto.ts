import {IsEmail, IsNotEmpty, MaxLength, IsPhoneNumber} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { IContact } from '../types';

export class CreateClientDTO {

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