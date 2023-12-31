import {EntityRepository, Repository} from "typeorm"
import {User} from "./user.entity"
import {CreateUserDTO} from "./dtos/create-user.dto"
import {CredentialsDto} from "../auth/dtos/credentials.dto"
import {UserRole} from "./user.roles.enum"
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import {ConflictException, InternalServerErrorException} from "@nestjs/common"

@EntityRepository(User)
export class UserRepository extends Repository<User>{
	async createUser(
		createUserDTO: CreateUserDTO,
		role: UserRole,
	): Promise<User> {
		const {email, name, password} = createUserDTO

		const user = this.create();
		user.email = email;
		user.name = name;
		user.role = role;
		user.status = true;
		// if(typeof(photo) === 'string'){
		// 	user.photo = Buffer.from(photo,'base64')
		// }
		user.confirmationToken = crypto.randomBytes(32).toString('hex');
		user.salt = await bcrypt.genSalt();
		user.password = await this.hashPassword(password, user.salt);
		try {
			await user.save();
			delete user.password;
			delete user.salt;
			return user
		} catch (error) {
			if(error.code.toString() === '23505'){
				throw new ConflictException('Endereço de email já está em uso');
			}else{
				throw new InternalServerErrorException(
					'Erro ao salvar o usuario no banco de dados',
				)
			}
		}
	}
	async getAllUsers():Promise<User[]>{
		const users = await this.find({
			select: ["id",'name', 'email']
		})
		///////////////////////////ATENCAO
		///////////////////////////ATENCAO
		///////////////////////////ATENCAO
		users.forEach(user => (
			{...user, photo: ''}
			))
			return users
		}
		///////////////////////////ATENCAO
		///////////////////////////ATENCAO
		///////////////////////////ATENCAO
		///////////////////////////ATENCAO
	async checkCredentials(credentialsDto:CredentialsDto): Promise<User>{
		const {email, password} = credentialsDto
		const user = await this.findOne({email, status:true})

		if(user && (await user.checkPassword(password))){
			return user
		}else{
			return null
		}
	}

	private async hashPassword(password: string, salt:string): Promise<string>{
		return bcrypt.hash(password, salt);
	}
}