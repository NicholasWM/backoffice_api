import { Controller, Post, Body, ValidationPipe, UseGuards, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import {UsersService} from './users.service'
import {CreateUserDTO} from './dtos/create-user.dto'
import {ReturnUserDTO} from './dtos/return-user.dto'
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guards';
import { ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/utils/file-upload';
import { GetUser } from 'src/auth/get-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService){}
	@Post('createAdmin')
	async createAdminUser(
		@Body(ValidationPipe) createUserDTO:CreateUserDTO,
	): Promise<ReturnUserDTO>{
		const user = await this.usersService.createAdminUser(createUserDTO);
		return {
			user, message: 'Administrador criado com sucesso',
		};
	}
	
	@Get()
	async getAllUsers():Promise<User[]>{
		const users = this.usersService.getAllUsers()
		return users
	}
}
