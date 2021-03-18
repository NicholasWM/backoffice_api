import { ApiProperty } from '@nestjs/swagger';

export class SearchClientsDTO {
	@ApiProperty({
		default: 0,
		required:false,
		description:'O numero da paginação',
	})
	page: number;

	@ApiProperty({
		default:'4daa9f36-accd-49d1-8550-41e43f31520d',
		description:'ID do Cliente que está agendando o Frete',
		required:false
	})
  clientId:string;

	@ApiProperty({
		default:'Abc',
		description:'Nome do Cliente',
		required:false
	})
  name:string;

	@ApiProperty({
		default:'Abc',
		description:'Nome do Cliente',
		required:false
	})
  email:string;
}