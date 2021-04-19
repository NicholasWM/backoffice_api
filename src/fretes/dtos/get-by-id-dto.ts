import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetFreteByIdDTO {
  @IsNotEmpty()
	@ApiProperty({
		default: "1a286701-f84d-4b3f-b301-4659474b95bb",
		required:true,
	})
  id:string
}