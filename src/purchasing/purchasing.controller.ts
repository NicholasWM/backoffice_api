import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { CreatePurchasingDto } from './dto/create-purchasing.dto';
import { UpdatePurchasingDto } from './dto/update-purchasing.dto';

@Controller('purchasing')
export class PurchasingController {
  constructor(private readonly purchasingService: PurchasingService) {}

  @Post()
  create(@Body() createPurchasingDto: CreatePurchasingDto) {
    return this.purchasingService.create(createPurchasingDto);
  }

  @Get()
  findAll() {
    return this.purchasingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchasingService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePurchasingDto: UpdatePurchasingDto) {
    return this.purchasingService.update(+id, updatePurchasingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchasingService.remove(+id);
  }
}
