import { Controller, Post, Body, ValidationPipe, Get, UseGuards, Req, HttpStatus } from '@nestjs/common';
import {AuthService} from './auth.service'
import {CreateUserDTO} from '../users/dtos/create-user.dto'
import {CredentialsDto} from '../auth/dtos/credentials.dto'
import { AuthGuard } from '@nestjs/passport'
import {User} from '../users/user.entity'
import { GetUser } from './get-user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
	){}
	@Post('/signup')
	async signup(
		@Body(ValidationPipe) createUserDTO:CreateUserDTO,
	): Promise<{message: string, statusCode:number, data:any}>{
		console.log(createUserDTO)
		const data = await this.authService.signUp(createUserDTO);
		console.log(data)
		return {
			statusCode: HttpStatus.OK,
			message: 'Cadastro realizado com sucesso',
			data,
		}
	}
	@Post('/signin')
	async signin(
		@Body(ValidationPipe) credentialsDto:CredentialsDto,
	):Promise<{token:string}>{
		return await this.authService.signin(credentialsDto)
	}
	
	@Get('/me')
	@UseGuards(AuthGuard())
	getMe(@GetUser() user:User):User{
		return user
	}
}