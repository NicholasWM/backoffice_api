import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FreteImagesRepository } from 'src/images/frete-images.repository';
import { UploadImage, getFiltersSearchFrete } from 'src/utils';
import { Between, Connection, getConnection, LessThan, MoreThan } from 'typeorm';
import { CreateFreteDTO, SearchFreteDTO } from './dtos';
import { Frete } from './fretes.entity';
import { FretesRepository } from './fretes.repository';
import { InsertImagesFreteDTO } from './dtos'
import { ClientRepository } from 'src/clients/clients.repository';
import { Frete_Image } from 'src/images/frete-images.entity';
import { IFreteWithImages } from './interfaces';

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
    let filters = getFiltersSearchFrete(searchFreteDTO)
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

  async insertImagesInFrete(insertImagesFreteDTO:InsertImagesFreteDTO): Promise<Boolean>{
    const frete = await this.fretesRepository.findOne({
      where:{
        id:insertImagesFreteDTO.freteId
      }
    })
    if(frete){
      const clientName = (await this.clientRepository.findOne({where:{id:frete.clientId}, select:['name']}))?.name
      if(insertImagesFreteDTO?.images?.length){
        for (let index = 0; index < insertImagesFreteDTO?.images.length; index++) {
          let dirname = `${frete.date.toLocaleDateString().split('/').join('')} - ${clientName} - ${frete.id}`
          let filename = await UploadImage({
            imageData: insertImagesFreteDTO?.images[index],
            categoryName: 'frete',
            dirname
          })
          if(typeof(filename) === 'string'){
            await this.freteImagesRepository.create({freteId:frete.id, name: String(filename), dirname}).save()
          }
        }
        return true
      }
    }
    return false
  }

  async getImages(searchFreteDTO: SearchFreteDTO){
    let loadFreteImages = async (fretes: Frete[]) : Promise<loadedFreteImages> => await Promise.all(fretes.map(
      async (frete: Frete) => 
        await this.freteImagesRepository.find({
          where:{
            freteId:frete.id,
          },
          order:
            {createdAt:'ASC'},
        })
      ))
    let joinFretesWithEachImagesOfFrete = (fretesImages:loadedFreteImages): IFreteWithImages[] => 
      (fretesImages).map(
        (images:Frete_Image[], index: number): IFreteWithImages => (
          {...fretes[index], fretes: images}
        )
      ) 
    const numberOfResults = 10
    let filters = getFiltersSearchFrete(searchFreteDTO)
    let fretes = await this.fretesRepository.find({
      where: filters,
      skip: searchFreteDTO?.page * numberOfResults || 0,
      take: numberOfResults
    })
    type loadedFreteImages = Array<Array<Frete_Image>>
    let fretesImagesLoaded = await loadFreteImages(fretes)
    return joinFretesWithEachImagesOfFrete(fretesImagesLoaded)
  }
}