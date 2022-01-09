import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RolesGuard } from 'src/auth/roles.guards';
import { Client } from './clients.entity';
import { ClientsService } from './clients.service';
import { CreateClientDTO, GetClientByIdDTO, ReturnClientDTO, SearchClientsDTO, UpdateClientDTO } from './dtos';

@ApiTags("Clients")
// @ApiBearerAuth()
// @UseGuards(AuthGuard(), RolesGuard)
@Controller('clients')
export class ClientsController {
	constructor(private clientsService: ClientsService){}
  
  @Post()
	async create(
		@Body(ValidationPipe) createClientDTO:CreateClientDTO,
		@Res() res:Response
	): Promise<Response<ReturnClientDTO>>{
		const contactAlreadyExists = await this.clientsService.findByContact({contacts: createClientDTO.contacts});
		if(contactAlreadyExists){
			return res.status(HttpStatus.CONFLICT).json({
				message: 'Contato já existe',
			});
		}
		const client = await this.clientsService.create(createClientDTO);
		if(client){
			return res.status(HttpStatus.CREATED).json({
				client,
				message: 'Cliente criado com sucesso',
			})
		}
		return res.status(HttpStatus.BAD_REQUEST).json({
			message: 'Erro ao criar o Cliente',
		})

	}
	@Get()
	async getWithFilters(
    @Query() searchClientsDTO: SearchClientsDTO
	):Promise<Client[]>{
		const clients = await this.clientsService.getWithFilters(searchClientsDTO);
		return clients
	}

	@Get('all')
	async getAll():Promise<Client[]>{
		const clients = await this.clientsService.getAll();
		return clients
	}

	@Get('search')
	async getOne(@Query() getClientByIdDTO:GetClientByIdDTO){
		const client = await this.clientsService.getOne(getClientByIdDTO);
		return client?
		{
			item:client,
			message: 'Cliente encontrado com sucesso',
		}
		:
		{
			item:client,
			message: 'Cliente não encontrado',
		};
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
