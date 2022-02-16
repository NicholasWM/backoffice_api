import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceRepository } from './prices.repository';

@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(PriceRepository)
    private priceRepository:PriceRepository,
  ){

  }
  async create(createPriceDto: CreatePriceDto) {
    return await this.priceRepository.create(createPriceDto).save()
  }
  
  findAll() {
    return this.priceRepository.find()
  }

  findAllActiveIds() {
    return this.priceRepository.find({where:{status:true}, select:['id']})
  }

  findOne(id: number) {
    return this.priceRepository.find({where:{id}})
  }
}
