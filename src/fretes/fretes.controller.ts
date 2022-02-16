import { Body, Controller, forwardRef, Get, Inject, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FretesService } from './fretes.service';
import { CancelFreteDTO, ConfirmFreteDTO, CreateFreteDTO, InsertImagesFreteDTO, InsertPaymentDTO, ReturnClientDTO, SearchFreteDTO, UpdateFreteDTO } from './dtos'
import { Frete } from './fretes.entity';
import { GetFreteByIdDTO } from './dtos/get-by-id-dto';
import { PostponeFreteDTO } from './dtos/postpone-frete-dto';
import { AuthGuard } from '@nestjs/passport';
import { BusyDatesFreteDTO } from './dtos/busy-dates-frete-dto';
import { GetBusyDatesResponse } from './interfaces';
import { TelegramService } from 'src/telegram/telegram.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/users/user.entity';

@ApiTags('Fretes')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('fretes')
export class FretesController {
  constructor(
    @Inject(forwardRef(() => FretesService))
    private freteService: FretesService,

    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
  ) { }

  @Post()

  async createFrete(
    @GetUser() user: User,
    @Body(ValidationPipe) createFreteDTO: CreateFreteDTO
  ): Promise<ReturnClientDTO> {
    console.log(new Date(createFreteDTO.date));

    const frete = await this.freteService.create(createFreteDTO) as Frete
    console.log(user);

    await this.telegramService.sendActionToAllUsers(
      {
        action: `criou um agendamento: `,
        moreDetails: 'frete',
        detailsParams: [frete],
        name: user?.telegram?.first_name,
        telegram_id: user?.telegram?.telegram_id
      }
      // `Criou um ${frete.state}`, 
      // `${frete.id}`, 
      // user?.telegram?.telegram_id, 
      // user?.telegram?.first_name
    )
    return { frete, message: '' }
  }

  @Get()
  async getAll(@Query() searchFreteDTO: SearchFreteDTO): Promise<Frete[]> {
    return await this.freteService.getAll(searchFreteDTO)
  }

  @Get('busyDates')
  async busyDates(@Query() busyDatesFreteDTO: BusyDatesFreteDTO): Promise<GetBusyDatesResponse | boolean> {
    return await this.freteService.getBusyDates(busyDatesFreteDTO)
  }

  @Get('search')
  async getOne(@Query() getClientByIdDTO: GetFreteByIdDTO) {
    if (Object.keys(getClientByIdDTO).length) {
      const frete = await this.freteService.getOne(getClientByIdDTO);
      return frete &&
      {
        item: frete,
        message: 'Frete encontrado com sucesso',
      }
    }
    return {
      message: 'Frete não encontrado',
    }
  }

  @Put('postpone')
  async postpone(
    @GetUser() user: User,
    @Body(ValidationPipe) postponeFreteDTO: PostponeFreteDTO
  ) {
    if (postponeFreteDTO?.newDate) {
      if (this.freteService.postponeDate(postponeFreteDTO)) {
        // await this.telegramService.sendActionToAllUsers(`Criou um ${frete.state}`, `${frete.id}`, user?.telegram?.telegram_id, user?.telegram?.first_name)

        return { message: `Adiada com sucesso para a data: ${new Date(postponeFreteDTO?.newDate).toLocaleDateString()}` }
      }
    }
    return { message: 'Erro ao executar a action!' }
  }

  @Put('cancel')
  async cancel(
    @GetUser() user: User,
    @Body(ValidationPipe) action: CancelFreteDTO
  ) {
    if (this.freteService.changeState(action.freteId, 'Cancelada')) {
      await this.telegramService.sendActionToAllUsers(
        {
          action: `cancelou um agendamento`,
          moreDetails: 'freteLink',
          detailsParams: [action.freteId],
          name: user?.telegram?.first_name,
          telegram_id: user?.telegram?.telegram_id
        }
      )
      return { message: 'Cancelada com sucesso' }
    }
    return { message: 'Erro ao executar a action!' }
  }

  @Put('confirm')
  async confirm(
    @GetUser() user: User,
    @Body(ValidationPipe) action: ConfirmFreteDTO
  ) {
    if (this.freteService.changeState(action.freteId, 'Confirmada')) {
      await this.telegramService.sendActionToAllUsers(
        {
          action: `confirmou um agendamento`,
          moreDetails: 'freteLink',
          detailsParams: [action.freteId],
          name: user?.telegram?.first_name,
          telegram_id: user?.telegram?.telegram_id
        }
      )
      return { message: 'Confirmada com sucesso' }
    }
    return { message: 'Erro ao executar a action!' }
  }

  @Put('insertPayment')
  async insertPayment(
    @GetUser() user: User,
    @Body(ValidationPipe) insertPaymentDTO: InsertPaymentDTO
  ) {
    if (this.freteService.insertPayment(insertPaymentDTO)) {
      return { message: 'Pagamento inserido com sucesso!' }
    }
    return { message: 'Erro ao executar a action!' }
  }

  @Post('images')
  async insertImages(@Body(ValidationPipe) insertImagesFreteDTO: InsertImagesFreteDTO) {
    return await this.freteService.insertImagesInFrete(insertImagesFreteDTO) ?
      {
        message: "Imagem inserida com sucesso!",
        status: true
      }
      : {
        message: "Erro ao inserir a imagem.",
        status: false
      }
  }

  // Pega as imagens de determinado frete pelo ID
  @Get('images/search')
  async searchImages(@Query() searchFreteDTO: SearchFreteDTO) {
    return await this.freteService.getImages(searchFreteDTO)
  }
}