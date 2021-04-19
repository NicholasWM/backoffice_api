import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator'

type actionsFrete = 'adiar' | 'cancelar' | 'confirmar'

export class UpdateFreteDTO {
	@IsNotEmpty()
	@IsIn(['adiar' , 'cancelar', 'confirmar', 'pagamento'])
	@ApiProperty({
		default:'Marcada',
		description:"'adiar' | 'cancelar' | 'confirmar'",
		required:true
	})
  action:actionsFrete;

	@IsNotEmpty({message:"Insira um freteId!"})
	@ApiProperty({
		default:'',
		description:'ID do frete que vai ser modificado.',
		required:true
	})
  freteId:string;

	@ApiProperty({
		default:'',
		description:'ID do frete que vai ser modificado.',
		required:false
	})
  newDate:string;
}