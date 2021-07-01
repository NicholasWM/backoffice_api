import { Body, Controller, Get, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FretesService } from './fretes.service';
import { CancelFreteDTO, ConfirmFreteDTO, CreateFreteDTO, InsertImagesFreteDTO, InsertPaymentDTO, ReturnClientDTO, SearchFreteDTO, UpdateFreteDTO } from './dtos'
import { Frete } from './fretes.entity';
import { GetFreteByIdDTO } from './dtos/get-by-id-dto';
import { PostponeFreteDTO } from './dtos/postpone-frete-dto';
import { AuthGuard } from '@nestjs/passport';
import { BusyDatesFreteDTO } from './dtos/busy-dates-frete-dto';

@ApiTags('Fretes')
@ApiBearerAuth()
@Controller('fretes')
export class FretesController {
  constructor(
    private freteService:FretesService,
  ){}
  
  @Post()
  async createFrete(@Body(ValidationPipe) createFreteDTO: CreateFreteDTO): Promise<ReturnClientDTO> {
    const frete = await this.freteService.create(createFreteDTO)
    return {frete, message:''}
  }
  
  @Get()
  async getAll(@Query() searchFreteDTO: SearchFreteDTO):Promise<Frete[]>{
    return await this.freteService.getAll(searchFreteDTO)
  }

  @Get('busyDates')
  async busyDates(@Query() busyDatesFreteDTO: BusyDatesFreteDTO):Promise<Frete[]>{
    return await this.freteService.getBusyDates(busyDatesFreteDTO)
  }

  @Get('search')
	async getOne(@Query() getClientByIdDTO:GetFreteByIdDTO){
    if(Object.keys(getClientByIdDTO).length){
      const frete = await this.freteService.getOne(getClientByIdDTO);
      return frete && 
        {
          item:frete,
          message: 'Frete encontrado com sucesso',
        }
      }
      return {
        message: 'Frete não encontrado',
      }
    }

  @Put('postpone')
	@UseGuards(AuthGuard())
  async postpone(@Body(ValidationPipe) postponeFreteDTO:PostponeFreteDTO){
    if(postponeFreteDTO?.newDate){
      if(this.freteService.postponeDate(postponeFreteDTO)){
        return {message: `Adiada com sucesso para a data: ${new Date(postponeFreteDTO?.newDate).toLocaleDateString()}`}
      }
    }
    return {message: 'Erro ao executar a action!'}
  }

  @Put('cancel')
	@UseGuards(AuthGuard())
  async cancel(@Body(ValidationPipe) action:CancelFreteDTO){
    if(this.freteService.changeState(action.freteId, 'Cancelada')){
      return {message: 'Cancelada com sucesso'}
    }
    return {message: 'Erro ao executar a action!'}
  }

  @Put('confirm')
	@UseGuards(AuthGuard())
  async confirm(@Body(ValidationPipe) action:ConfirmFreteDTO){
    if(this.freteService.changeState(action.freteId, 'Confirmada')){
      return {message: 'Confirmada com sucesso'}
    }
    return {message: 'Erro ao executar a action!'}
  }

  @Put('insertPayment')
  async insertPayment(@Body(ValidationPipe) insertPaymentDTO:InsertPaymentDTO){
    if(this.freteService.insertPayment(insertPaymentDTO)){
      return {message: 'Pagamento inserido com sucesso!'}
    }
    return {message: 'Erro ao executar a action!'}
  }

  @Post('images')
  async insertImages(@Body(ValidationPipe) insertImagesFreteDTO: InsertImagesFreteDTO){
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
  async searchImages(@Query() searchFreteDTO:SearchFreteDTO){
    return await this.freteService.getImages(searchFreteDTO)
  }
}