import { ApiProperty } from '@nestjs/swagger';
import { Client } from "../clients.entity";

export class ReturnClientDTO{
	@ApiProperty()
	cliet: Client;
	
	@ApiProperty()
	message: string;
}