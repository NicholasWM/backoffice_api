import { ApiProperty } from '@nestjs/swagger';

export class CredentialsDto {
	@ApiProperty({
		default:'abc@abc.com'
	})
	email: string;
	
	@ApiProperty({
		default:'secret123'
	})
	password: string;
}