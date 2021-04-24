import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator'

export class InsertPaymentDTO {
	@IsNotEmpty({message:"Insira um freteId!"})
	@ApiProperty({
		default:'',
		description:'ID do frete que vai ser modificado.',
		required:true
	})
  freteId:string;

	@IsNotEmpty({message:"Insira o numero do tipo de pagamento: 1 - Debit, 2 - Credit, 3 - Money, 4 - Deposit"})
	@ApiProperty({
		default:'',
		description:'Number of type of payment. 1 - Debit, 2 - Credit, 3 - Money, 4 - Deposit',
		required:false
	})
  type:number;

	@IsNotEmpty()
	@ApiProperty({
		default:'',
		description:'Value inserted',
		required:false
	})
  value:number;
}