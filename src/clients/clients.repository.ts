import { ConflictException, InternalServerErrorException } from "@nestjs/common"
import {EntityRepository, Repository} from "typeorm"
import {Client} from "./clients.entity"
import { CreateClientDTO } from "./dtos/create-client-dto"

@EntityRepository(Client)
export class ClientRepository extends Repository<Client>{
  async createClient(createClientDTO: CreateClientDTO): Promise<Client>{
    const client = this.create();
    client.email = createClientDTO?.email;
    client.name = createClientDTO?.name;
    try {
      await client.save();
      return client
    } catch (error) {
      if(error.code.toString() === '23505'){
				throw new ConflictException('Endereço de email já está em uso');
			}else{
				throw new InternalServerErrorException(error?.message)
			}
    }
  }
}