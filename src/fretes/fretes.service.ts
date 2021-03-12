import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThan } from 'typeorm';
import { CreateFreteDTO, SearchFreteDTO } from './dtos';
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

  async getAll(searchFreteDTO:SearchFreteDTO): Promise<Frete[]>{
    const numberOfResults = 30
    let filters:any = {}
    Object.keys(searchFreteDTO).map(key => {
      if(searchFreteDTO[key] && key !== 'page'){
        filters[key] = searchFreteDTO[key]
      }
    })
    if(Object.keys(filters).includes('initialDate')
    && Object.keys(filters).includes('finalDate')){
      filters['date'] = Between(filters?.initialDate, filters?.finalDate)
      delete filters['initialDate']
      delete filters['finalDate']
    }else{
      if(Object.keys(filters).includes('initialDate')){
        filters['date'] = MoreThan(filters?.initialDate)
        delete filters['initialDate']
      }
      if(Object.keys(filters).includes('finalDate')){
        filters['date'] = LessThan(filters?.finalDate)
        delete filters['finalDate']
      }
    }

    return await this.fretesRepository.find({
      order:
        {date:'ASC'},
      select:[
        'clientId',
        'date',
        'email',
        'price',
        'state',
        'updatedAt',
        'postponed_frete',
        'deposit_returned'
      ],
      where:
        filters,
      skip:
        searchFreteDTO?.page * numberOfResults || 0,
      take:
        numberOfResults
    })
  }
}