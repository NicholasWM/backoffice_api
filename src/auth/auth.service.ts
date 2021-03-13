import { Injectable, UnprocessableEntityException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../users/users.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDTO } from '../users/dtos/create-user.dto'
import { CredentialsDto } from '../auth/dtos/credentials.dto'
import { UserRole } from '../users/user.roles.enum'
import { JwtService } from '@nestjs/jwt'
import { GetBase64ImageFromSystem, UploadImage } from 'src/utils/file-upload';
import { UserImagesRepository } from 'src/images/user-images.repository';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserImagesRepository)
		private userImagesRepository: UserImagesRepository,

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
								
				if(createUserDTO?.photo){
					let filename = await UploadImage({imageData: createUserDTO.photo, categoryName: 'user', dirname: `${user.id}`})
					if(typeof(filename) === 'string'){
						this.userImagesRepository.create({user, name: String(filename)}).save()
					}
					return {id:user.id, name:user.name, email:user.email, token, images: createUserDTO?.photo}
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
		const image = await this.userImagesRepository.find({where:{userId:user.id}})
		if(image){
			const photo = await GetBase64ImageFromSystem(image[0].name, 'user')
			return {id:user.id, name:user.name, email:user.email, token, images: photo}
		}
		return {id:user.id, name:user.name, email:user.email, token}
	}
	async getToken(id){ return await this.jwtService.sign({id})}

	
}