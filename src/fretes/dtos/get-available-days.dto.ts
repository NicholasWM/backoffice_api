import { IsArray, IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class GetAvailableDaysDTO {
	@IsNotEmpty()
	@ApiProperty()
	month: number;

	@IsNotEmpty()
	@ApiProperty()
	year: number;
	
	@ApiProperty()
	typeOfDays?: 'Sabado' | 'Domingo' | 'Dia de Semana' | 'Segunda' | 'Terca' | 'Quarta' | 'Quinta' | 'Sexta';
}