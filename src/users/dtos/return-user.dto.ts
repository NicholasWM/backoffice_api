import {User} from "../user.entity"
import { ApiProperty } from '@nestjs/swagger';

export class ReturnUserDTO{
	@ApiProperty()
	user: User;
	
	@ApiProperty()
	message: string;
}