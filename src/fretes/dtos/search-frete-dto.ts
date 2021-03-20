import { ApiProperty } from '@nestjs/swagger';

export class SearchFreteDTO {
	@ApiProperty({
		default: 0,
		required:false,
	})
	page: number;
	
	@ApiProperty({
		description:'2020/10/02',
		required:false
	})
  initialDate:string;
	
	@ApiProperty({
		description:'2022/12/30',
		required:false
	})
  finalDate:string;

	@ApiProperty({
		description:'4daa9f36-accd-49d1-8550-41e43f31520d',
		required:false
	})
  clientId:string;

	@ApiProperty({
		description:'Marcada, Cancelada, Adiada ou Confirmada',
		required:false
	})
  state:string;
}