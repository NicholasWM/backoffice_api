import { IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class InsertUserInterest {
	@IsNotEmpty({message: 'Informe um nome do interesse!',})
	@ApiProperty()
	name: string;
	
	@IsNotEmpty({message: 'Informe um estado',})
	@ApiProperty()
  state: boolean;
}