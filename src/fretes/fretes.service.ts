import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFreteDTO } from './dtos';
import { Frete } from './fretes.entity';
import { FretesRepository } from './fretes.repository';

@Injectable()
export class FretesService {
  constructor(
    @InjectRepository(FretesRepository)
    private fretesRepository:FretesRepository,
  ){}

  async create(createFreteDTO:CreateFreteDTO): Promise<Frete>{
    return this.fretesRepository.create({
      clientId: createFreteDTO.clientId,
      date: new Date(createFreteDTO.date),
      email: createFreteDTO.email,
      price: createFreteDTO.price
    }).save()
  }
}
