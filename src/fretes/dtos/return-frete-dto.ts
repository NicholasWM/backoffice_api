import { ApiProperty } from '@nestjs/swagger';
import { Frete } from "../fretes.entity";

export class ReturnClientDTO{
	@ApiProperty()
	frete: Frete;
	
	@ApiProperty()
	message: string;
}