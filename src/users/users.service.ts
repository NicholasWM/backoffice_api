import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm'
import {UserRepository} from './users.repository'
import {CreateUserDTO} from './dtos/create-user.dto'
import {UserRole} from './user.roles.enum'
import {User} from './user.entity'
@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository:UserRepository,
	){}

	async createAdminUser(createUserDTO: CreateUserDTO): Promise<User>{
		if(createUserDTO.password != createUserDTO.passwordConfirmation){
			throw new UnprocessableEntityException('As senhas não conferem');
		}else{
			
			return this.userRepository.createUser(createUserDTO, UserRole.ADMIN);
		}
	}


	async getAllUsers():Promise<User[]>{
		return this.userRepository.getAllUsers()
	}
}
