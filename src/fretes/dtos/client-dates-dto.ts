import { ApiProperty } from '@nestjs/swagger';
import { IConsultClientDateType } from 'src/telegram/types';

export class ClientDatesFreteDTO {
	@ApiProperty({
		default: true,
		required: false,
	})
	consultType: IConsultClientDateType;

	@ApiProperty({
		default: true,
		required: false,
	})
	pageSelected?: number;

	@ApiProperty({
		default: true,
		required: false,
	})
	numberOfResults?: number;

	@ApiProperty({
		default: true,
		required: false,
	})
	clientId?: string;

	@ApiProperty({
		description: 'Domingo',
		required: false,
		default: null
	})
	weekdays?: string[];
}