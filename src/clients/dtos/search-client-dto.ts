import { ApiProperty } from '@nestjs/swagger';

export class SearchClientsDTO {
	@ApiProperty({
		default: 0,
		required:false,
		description:'O numero da paginação',
	})
	page: number;
}