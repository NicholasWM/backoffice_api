import { Controller, Get, Post, Body, Put, Param, Delete, ValidationPipe, Query } from '@nestjs/common';
import { BoatmanService } from './boatman.service';
import { CreateBoatmanDto } from './dto/create-boatman.dto';
import { UpdateBoatmanDto } from './dto/update-boatman.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FretesService } from 'src/fretes/fretes.service';
import { GetAvailableBoatmenDTO } from './dto/get-available-boatmen';

@ApiTags('Boatman')
@ApiBearerAuth()
@Controller('boatman')
export class BoatmanController {
  constructor(
    private readonly boatmanService: BoatmanService,
    private readonly fretesService: FretesService

  ) {}

  @Post()
  create(@Body() createBoatmanDto: CreateBoatmanDto) {
    return this.boatmanService.create(createBoatmanDto);
  }

  @Get()
  findAll() {
    return this.boatmanService.findAll();
  }

  @Get('available')
  findAllAvailable(@Query() getAvailableBoatmenDTO:GetAvailableBoatmenDTO) {
    return this.fretesService.boatmenAvailable(getAvailableBoatmenDTO);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boatmanService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBoatmanDto: UpdateBoatmanDto) {
    return this.boatmanService.update(+id, updateBoatmanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boatmanService.remove(+id);
  }
}
