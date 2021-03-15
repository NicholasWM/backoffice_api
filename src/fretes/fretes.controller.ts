import { Body, Controller, Delete, Get, Post, Put, Query, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { FretesService } from './fretes.service';
import { CreateFreteDTO, InsertImagesFreteDTO, ReturnClientDTO, SearchFreteDTO } from './dtos'
import { Frete } from './fretes.entity';
@ApiTags('Fretes')
// @ApiBearerAuth()
@Controller('fretes')
export class FretesController {
  constructor(
    private freteService:FretesService,
  ){}
  
  @Post()
  async createFrete(
    @Body(ValidationPipe) createFreteDTO: CreateFreteDTO
  ): Promise<ReturnClientDTO> {
    const frete = await this.freteService.create(createFreteDTO)
    return {frete, message:''}
  }
  
  @Get()
  async getAllFrete(
    @Query() searchFreteDTO: SearchFreteDTO
  ):Promise<Frete[]>{
    return await this.freteService.getAll(searchFreteDTO)
  }

  // @Put()
  // async updateFrete(){}

  // @Delete()
  // async deleteFrete(){}

  // Insere imagens em determinado frete
  // Recebe o parametro de qual é o frete e as imagens em Base64
  @Post('images')
  async insertImages(
    @Body(ValidationPipe) insertImagesFreteDTO: InsertImagesFreteDTO
  ){
    return await this.freteService.insertImagesInFrete(insertImagesFreteDTO) ?
      {
        message:"Imagem inserida com sucesso!",
        status:true
      } 
     :{
        message:"Erro ao inserir a imagem.",
        status:false
      }
  }

  // Pega as imagens de determinado frete pelo ID
  @Get('images/search')
  async searchImages(
    @Query() searchFreteDTO: SearchFreteDTO
  ){
    return await this.freteService.getImages(searchFreteDTO)
  }
}