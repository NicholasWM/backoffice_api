import { ApiProperty } from '@nestjs/swagger';

export class FacebookDto {
	@ApiProperty()
	email: string;

	@ApiProperty()
	firstName: string;

	@ApiProperty()
	lastName: string;

	@ApiProperty()
	id: string;

	@ApiProperty()
	photos: any;
}