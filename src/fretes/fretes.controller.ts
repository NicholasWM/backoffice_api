import { Body, Controller, Delete, Get, Post, Put, Query, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { FretesService } from './fretes.service';
import { CreateFreteDTO, InsertImagesFreteDTO, ReturnClientDTO, SearchFreteDTO, UpdateFreteDTO } from './dtos'
import { Frete } from './fretes.entity';
import { dateRegex } from 'src/utils';
import { GetFreteByIdDTO } from './dtos/get-by-id-dto';



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
  async getAll(
    @Query() searchFreteDTO: SearchFreteDTO
  ):Promise<Frete[]>{
    return await this.freteService.getAll(searchFreteDTO)
  }

  @Get('search')
	async getOne(@Query() getClientByIdDTO:GetFreteByIdDTO){
		const frete = await this.freteService.getOne(getClientByIdDTO);
		return frete?
		{
			item:frete,
			message: 'Cliente encontrado com sucesso',
		}
		:
		{
			item:frete,
			message: 'Cliente não encontrado',
		};
	}
  
  // Adiar Frete
  // Cancelar Frete
  // Confirmar Frete
  // Inserir pagamento
  @Put()
  async updateFrete(
    @Body(ValidationPipe) action:UpdateFreteDTO
  ){
    const actions = {
      'adiar': () => {
        if(dateRegex(action.newDate)){
          if(this.freteService.postponeDate(action.newDate, action.freteId)){
            return {message: `Adiada com sucesso para a data: ${new Date(action.newDate).toLocaleDateString()}`}
          }
        }
      },
      'cancelar': () => {
        if(this.freteService.changeState(action.freteId, 'Cancelada')){
          return {message: 'Cancelada com sucesso'}
        }
      },
      'confirmar': () => {
        if(this.freteService.changeState(action.freteId, 'Confirmada')){
          return {message: 'Confirmada com sucesso'}
        }
      },
      'pagamento': () => {
        if(this.freteService.changeState(action.freteId, 'Confirmada')){
          return {message: 'Pagamento inserido com sucesso!'}
        }
      },
    }
    const message = actions[action.action]()
    return !!message ? message : {message: 'Erro ao executar a action!'}
  }



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