import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ParkingService } from './parking.service';
import { CreateParkingDto } from './dto/create-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { ApiTags } from '@nestjs/swagger';
import { SearchParkingDTO } from './dto/search-parking-dto';

@ApiTags('Parking')
@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Post()
  create(@Body() createParkingDto: CreateParkingDto) {
    return this.parkingService.create(createParkingDto);
  }

  @Get()
  findAll(@Query() searchParkingDTO: SearchParkingDTO) {
    return this.parkingService.getAll(searchParkingDTO);
  }

  @Put()
  update(@Body() updateParkingDto: UpdateParkingDto) {
    return this.parkingService.update(updateParkingDto);
  }
}
