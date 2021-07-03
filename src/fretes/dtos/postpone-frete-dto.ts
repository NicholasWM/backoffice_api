import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator'

export class PostponeFreteDTO {
	@IsNotEmpty({message:"Insira um freteId!"})
	@ApiProperty({
		default:'',
		description:'ID do frete que vai ser modificado.',
		required:true
	})
  freteId:string;

	@IsNotEmpty()
	@ApiProperty({
		default:'',
		description:'ID do frete que vai ser modificado.',
		required:false
	})
  newDate:string;
}