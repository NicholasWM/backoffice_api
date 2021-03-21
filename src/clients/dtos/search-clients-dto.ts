import { ApiProperty } from '@nestjs/swagger';

export class SearchClientsDTO {
	@ApiProperty({
		default: 0,
		required:false,
		description:'O numero da paginação',
	})
	page: number;

	@ApiProperty({
		description:'4daa9f36-accd-49d1-8550-41e43f31520d',
		required:false
	})
  id:string;

	@ApiProperty({
		description:'Abc',
		required:false
	})
  name:string;

	@ApiProperty({
		description:'Abc',
		required:false
	})
  email:string;
}