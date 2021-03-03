import { Injectable, UnprocessableEntityException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../users/users.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDTO } from '../users/dtos/create-user.dto'
import { CredentialsDto } from '../auth/dtos/credentials.dto'
import { User } from '../users/user.entity'
import { UserRole } from '../users/user.roles.enum'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,
		private jwtService:JwtService,
	){}

	async signUp(createUserDTO: CreateUserDTO): Promise<any>{
		if(createUserDTO.password != createUserDTO.passwordConfirmation){
			throw new UnprocessableEntityException('As senhas não conferem')
		}else{
			const [exists, number] = await this.userRepository.findAndCount({where:{email:createUserDTO.email}})
			if(!number){
				const user = await this.userRepository.createUser(createUserDTO, UserRole.USER)
				const jwtPayload = {
					id:user.id
				}
				const token = await this.jwtService.sign(jwtPayload)
				if(user?.photo){
					return {id:user.id, name:user.name, photo: Buffer.from(user?.photo).toString('base64'), email:user.email, token}
				}
				return {...user, token}
			}
			throw new UnprocessableEntityException('Email já existe!')
		}
	}


	async signin(credentialsDto:CredentialsDto){
		// console.log(credentialsDto)
		const user = await this.userRepository.checkCredentials(credentialsDto);
		if(user === null){
			throw new UnauthorizedException('Credenciais Inválidas')
		}
		const jwtPayload = {
			id:user.id
		}
		const token = await this.jwtService.sign(jwtPayload)
		
		return {id:user.id, name:user.name, photo: user?.photo ? Buffer.from(user?.photo).toString('base64'):undefined, email:user.email, token}
	}
	async getToken(id){ return await this.jwtService.sign({id})}

	
}