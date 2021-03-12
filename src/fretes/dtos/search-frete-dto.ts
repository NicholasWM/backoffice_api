import { ApiProperty } from '@nestjs/swagger';

export class SearchFreteDTO {
	@ApiProperty({
		default: 0,
		required:false,
		description:'O numero da paginação',
	})
	page: number;
	
	@ApiProperty({
		default:'2020/10/02',
		description:'A data inicial',
		required:false
	})
  initialDate:string;
	
	@ApiProperty({
		default:'2022/12/30',
		description:'A data final',
		required:false
	})
  finalDate:string;

	@ApiProperty({
		default:'4daa9f36-accd-49d1-8550-41e43f31520d',
		description:'ID do Cliente que está agendando o Frete',
		required:false
	})
  clientId:string;

	@ApiProperty({
		default:'Marcada',
		description:'Marcada, Cancelada, Adiada ou Confirmada',
		required:false
	})
  state:string;
}