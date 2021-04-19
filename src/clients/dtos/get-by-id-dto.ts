import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetClientByIdDTO {
  @IsNotEmpty()
	@ApiProperty({
		default: "e3d508f8-4591-4674-8bb8-cfeb2820f1a7",
		required:true,
	})
  id:string
}