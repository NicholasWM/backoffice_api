import { Body, Controller, Get, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guards';
import { Client } from './clients.entity';
import { ClientsService } from './clients.service';
import { CreateClientDTO } from './dtos/createClientDTO';

@ApiTags("Clients")
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
	constructor(private clientsService: ClientsService){}
  
  @Post()
	@UseGuards(AuthGuard(), RolesGuard)
	async createAdminUser(
		@Body(ValidationPipe) createClientDTO:CreateClientDTO,
	// ): Promise<ReturnClientDTO>{
	){
		const client = await this.clientsService.create(createClientDTO);
    console.log(client)
		return {
			client, message: 'Administrador criado com sucesso',
		};
	}
	@Get()
	@UseGuards(AuthGuard(), RolesGuard)
	async getAll():Promise<Client[]>{
		const clients = await this.clientsService.getAll();
		return clients
	}
}
