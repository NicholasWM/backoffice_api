import {IsNotEmpty} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

class User {
	@IsNotEmpty({message: 'Informe um endereço de email',})
	@ApiProperty()
	email: string;
	
	@IsNotEmpty({message: 'Informe o nome do usuario'})
	@ApiProperty()
	firstName: string;
	
	@ApiProperty()
	lastName: string;
	
	@ApiProperty()
	picture: string;
} 

export class GoogleReqDTO {
	user: User;
	message: string
}