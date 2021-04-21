import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator'

export class ConfirmFreteDTO {
	@IsNotEmpty({message:"Insira um freteId!"})
	@ApiProperty({
		default:'',
		description:'ID do frete que vai ser modificado.',
		required:true
	})
  freteId:string;
}