import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateTelegramUserDto {
	@IsNotEmpty()
	@ApiProperty({
		description:"4daa9f36-accd-49d1-8550-41e43f31520d",
	})
	userId: string;
}
