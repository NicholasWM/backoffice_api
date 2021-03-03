import {IsEmail, IsNotEmpty, MaxLength, MinLength, Max} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
	@IsNotEmpty({
		message: 'Informe um endereço de email',
	})
	@IsEmail({},{
		message: 'Informe um endereço de email válido'
	})
	@MaxLength(200,{
		message: 'O endereço de email deve ter pelo menos 200 caracteres',
	})
	@ApiProperty()
	email: string;

	@IsNotEmpty({
		message: 'Informe o nome do usuario'
	})
	@MaxLength(200,{
		message: 'O nome do usuario deve ter menos de 200 caracteres',
	})
	@ApiProperty()
	name: string;

	@MaxLength(200,{
		message: 'O nome do usuario deve ter menos de 200 caracteres',
	})
	@ApiProperty()
	username: string;

	@IsNotEmpty({
		message: 'Informe uma senha',
	})
	@MinLength(6, {
		message: 'A senha deve ter no mínimo 6 caracteres',
	})
	@ApiProperty()
	password: string;

	@IsNotEmpty({
		message: 'Informe uma senha',
	})
	@MinLength(6, {
		message: 'A senha deve ter no mínimo 6 caracteres',
	})
	@ApiProperty()
	passwordConfirmation: string;

	@ApiProperty()
	photo: string;

	@ApiProperty()
	photoURI: String;
}