import { ConflictException, InternalServerErrorException } from "@nestjs/common"
import {EntityRepository, Repository} from "typeorm"
import {Client} from "./clients.entity"
import { CreateClientDTO } from "./dtos/createClientDTO"

@EntityRepository(Client)
export class ClientRepository extends Repository<Client>{
  async createClient(createClientDTO: CreateClientDTO): Promise<Client>{
    const client = this.create()
    client.email = createClientDTO?.email;
    client.name = createClientDTO?.name;
    client.whats_app_1 = createClientDTO?.whats_app_1;
    client.whats_app_2 = createClientDTO?.whats_app_2;
    if(typeof(createClientDTO.photo) === 'string'){
      client.photo = Buffer.from(createClientDTO.photo,'base64')
    }
    try {
      await client.save()
      return client
    } catch (error) {
      if(error.code.toString() === '23505'){
				throw new ConflictException('Endereço de email já está em uso');
			}else{
				throw new InternalServerErrorException(
					'Erro ao salvar o cliente no banco de dados',
				)
			}
    }
  }
}