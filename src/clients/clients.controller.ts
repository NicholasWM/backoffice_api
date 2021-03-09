import { Body, Controller, Get, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guards';
import { Client } from './clients.entity';
import { ClientsService } from './clients.service';
import { CreateClientDTO } from './dtos/create-client-dto';
import { ReturnClientDTO } from './dtos/return-client-dto';

@ApiTags("Clients")
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
@Controller('clients')
export class ClientsController {
	constructor(private clientsService: ClientsService){}
  
  @Post()
	async createAdminUser(
		@Body(ValidationPipe) createClientDTO:CreateClientDTO,
	): Promise<ReturnClientDTO>{
		const client = await this.clientsService.create(createClientDTO);
		return {
			client,
			message: 'Cliente criado com sucesso',
		};
	}
	@Get()
	async getAll():Promise<Client[]>{
		const clients = await this.clientsService.getAll();
		return clients
	}
}
