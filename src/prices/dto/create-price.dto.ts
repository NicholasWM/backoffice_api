import { IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriceDto {
	@IsNotEmpty()
	@ApiProperty({
		description:"Dia de semana/ Final de Semana/ Feriado",
	})
	description: string;

	@ApiProperty()
	value: number;

	@ApiProperty()
  status:boolean;
}
