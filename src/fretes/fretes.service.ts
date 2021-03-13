import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FreteImagesRepository } from 'src/images/frete-images.repository';
import { UploadImage } from 'src/utils/file-upload';
import { Between, LessThan, MoreThan } from 'typeorm';
import { CreateFreteDTO, SearchFreteDTO } from './dtos';
import { Frete } from './fretes.entity';
import { FretesRepository } from './fretes.repository';
import { InsertImagesFreteDTO } from './dtos'
import { ClientRepository } from 'src/clients/clients.repository';

@Injectable()
export class FretesService {
  constructor(
    @InjectRepository(FretesRepository)
    private fretesRepository:FretesRepository,

    @InjectRepository(FreteImagesRepository)
    private freteImagesRepository:FreteImagesRepository,

    @InjectRepository(ClientRepository)
    private clientRepository:ClientRepository,
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
        'deposit_returned',
        'id'
      ],
      where:
        filters,
      skip:
        searchFreteDTO?.page * numberOfResults || 0,
      take:
        numberOfResults
    })
  }

  async insertImagesInFrete(insertImagesFreteDTO:InsertImagesFreteDTO): Promise<any>{
    const frete = await this.fretesRepository.findOne({
      where:{
        id:insertImagesFreteDTO.freteId
      }
    })
    if(frete){
      const clientName = (await this.clientRepository.findOne({where:{id:frete.clientId}, select:['name']}))?.name
      if(insertImagesFreteDTO?.images?.length){
        for (let index = 0; index < insertImagesFreteDTO?.images.length; index++) {
          let filename = await UploadImage({
            imageData: insertImagesFreteDTO?.images[index],
            categoryName: 'frete',
            dirname: `${frete.date.toLocaleDateString().split('/').join('')} - ${clientName} - ${frete.id}`
          })
          if(typeof(filename) === 'string'){
            await this.freteImagesRepository.create({freteId:frete.id, name: String(filename)}).save()
          }
        }
        return true
      }
    }
    return false
  }
}