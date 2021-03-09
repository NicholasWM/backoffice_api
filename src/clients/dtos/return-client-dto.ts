import { ApiProperty } from '@nestjs/swagger';
import { Client } from "../clients.entity";

export class ReturnClientDTO{
	@ApiProperty()
	client: Client;
	
	@ApiProperty()
	message: string;
}