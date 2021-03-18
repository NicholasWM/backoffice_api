import { Body, Controller, Get, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guards';
import { Client } from './clients.entity';
import { ClientsService } from './clients.service';
import { CreateClientDTO, ReturnClientDTO, SearchClientsDTO, UpdateClientDTO } from './dtos';

@ApiTags("Clients")
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
@Controller('clients')
export class ClientsController {
	constructor(private clientsService: ClientsService){}
  
  @Post()
	async create(
		@Body(ValidationPipe) createClientDTO:CreateClientDTO,
	): Promise<ReturnClientDTO>{
		const client = await this.clientsService.create(createClientDTO);
		return {
			client,
			message: 'Cliente criado com sucesso',
		};
	}
	@Get()
	async getAll(
    @Query() searchClientsDTO: SearchClientsDTO
	):Promise<Client[]>{
		const clients = await this.clientsService.getAll(searchClientsDTO);
		return clients
	}

	@Put()
	async update(
		@Body(ValidationPipe) updateClientDTO:UpdateClientDTO,
	){
		const client = await this.clientsService.update(updateClientDTO);
		return {
			client,
			message: 'Cliente atualizado com sucesso',
		};
	}
}
