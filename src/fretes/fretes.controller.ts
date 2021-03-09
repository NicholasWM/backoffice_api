import { Body, Controller, Delete, Get, Post, Put, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FretesService } from './fretes.service';
import { CreateFreteDTO, ReturnClientDTO } from './dtos'
import { Frete } from './fretes.entity';
@ApiTags('Fretes')
// @ApiBearerAuth()
@Controller('fretes')
export class FretesController {
  constructor(private freteService:FretesService){}
  
  @Post()
  async createFrete(
    @Body(ValidationPipe) createFreteDTO: CreateFreteDTO
  ): Promise<ReturnClientDTO> {
    return {frete:await this.freteService.create(createFreteDTO), message:''}
  }
  
  // Paginação
  @Get()
  async getAllFrete(){}

  @Get('search')
  async getFrete(){}

  @Put()
  async updateFrete(){}

  @Delete()
  async deleteFrete(){}

  // Insere imagens em determinado frete
  // Recebe o parametro de qual é o frete e as imagens em Base64
  @Post('images')
  async insertImages(){}

  // Pega as imagens de determinado frete pelo ID
  @Get('images/search')
  async searchImages(){}

  // Retorna todas as imagens em ordem crescente pela data
  @Get('images')
  async getImages(){}
}
