import { IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientDTO {
	@ApiProperty({
		default:'abc@abc.com',
		description:'User email',
    required: false
	})
	email: string;

  @IsNotEmpty()
	@MaxLength(200,{
		message: 'O nome do usuario deve ter menos de 200 caracteres',
	})
	@ApiProperty({
		default:'',
    required: true
	})
	id: string;

	@ApiProperty({
		default:'Abc Client',
    required: false
	})
	name: string;
}