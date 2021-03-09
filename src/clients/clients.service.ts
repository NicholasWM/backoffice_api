import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './clients.entity';
import { ClientRepository } from './clients.repository';
import { CreateClientDTO } from './dtos/create-client-dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientRepository)
    private clientsRepository: ClientRepository,
  ){}

  async create(createClientDTO: CreateClientDTO): Promise<Client>{
    return await this.clientsRepository.createClient(createClientDTO)
  }
  
  async getAll():Promise<Client[]>{
    const clients = await this.clientsRepository.find({
      select: ["id",'name', 'email', 'whats_app_1', 'whats_app_2']
    });
    return clients
  }
}
