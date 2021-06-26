import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FreteImagesRepository } from 'src/images/frete-images.repository';
import { UploadImage, getFiltersSearchFrete, GetBase64ImageFromSystem } from 'src/utils';
import { CreateFreteDTO, InsertPaymentDTO, PostponeFreteDTO, SearchFreteDTO } from './dtos';
import { Frete } from './fretes.entity';
import { FretesRepository } from './fretes.repository';
import { InsertImagesFreteDTO } from './dtos'
import { ClientRepository } from 'src/clients/clients.repository';
import { Frete_Image } from 'src/images/frete-images.entity';
import { ICounters, IFreteWithImages } from './interfaces';
import { IState } from './types';
import { PriceRepository } from 'src/prices/prices.repository';
import { Between, In } from 'typeorm';
import { GetFreteByIdDTO } from './dtos/get-by-id-dto';
import { BusyDatesFreteDTO } from './dtos/busy-dates-frete-dto';
const months = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
@Injectable()
export class FretesService {
  constructor(
    @InjectRepository(FretesRepository)
    private fretesRepository:FretesRepository,

    @InjectRepository(FreteImagesRepository)
    private freteImagesRepository:FreteImagesRepository,

    @InjectRepository(ClientRepository)
    private clientRepository:ClientRepository,

    @InjectRepository(PriceRepository)
    private priceRepository:PriceRepository,
  ){}
  // async create(createFreteDTO:CreateFreteDTO): Promise<Frete>{
  async create(createFreteDTO:CreateFreteDTO): Promise<any>{
    const [client, count] = await this.clientRepository.findAndCount({where:{id:createFreteDTO.clientId}})
    if(count === 0){
      return `Invalid User ID: ${createFreteDTO.clientId}` 
    }
    if(createFreteDTO.prices){
      const catchInvalidPricesID = () => createFreteDTO.prices.filter((priceId, index)=> !prices.map(({id})=> id).includes(priceId))
      const prices = await this.priceRepository.find({
        where: {
          id: In(createFreteDTO.prices)
        }
      })
      const invalidPrices = catchInvalidPricesID()
      if(invalidPrices.length){
        return `Invalid Prices: ${invalidPrices}` 
      }
      return this.fretesRepository.create({
        clientId: createFreteDTO.clientId,
        date: new Date(createFreteDTO.date),
        prices: prices
      }).save()
    }
    if(createFreteDTO.customPrice){
      return this.fretesRepository.create({
        clientId: createFreteDTO.clientId,
        date: new Date(createFreteDTO.date),
        customPrice: createFreteDTO.customPrice
      }).save()
    }
  }
  async getAll(searchFreteDTO:SearchFreteDTO): Promise<Frete[]>{
    const numberOfResults = 30
    let filters = getFiltersSearchFrete(searchFreteDTO)
    return await this.fretesRepository.find({
      relations:['prices'],
      order:
        {date:'ASC'},
      select:[
        'clientId',
        'date',
        'state',
        'updatedAt',
        'createdAt',
        'postponed_new_id',
        'postponed_old_id',
        'deposit_returned',
        'id',
        'customPrice',
        'creditPaid',
        'debitPaid',
        'depositPaid',
        'discount',
        'moneyPaid',
        'numberOfPeople',
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
    let joinFretesWithEachImagesData = (fretesImages:loadedFreteImages): IFreteWithImages[] => 
      (fretesImages).map(
        (images:Frete_Image[], index: number): IFreteWithImages => (
          {...fretes[index], images}
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
    const convertObjectTo64Image = 
      (freteList:IFreteWithImages[])=>
        freteList.map((frete:IFreteWithImages)=> Promise.all(frete.images?.map(
            async image => 
              await GetBase64ImageFromSystem({imageName:image.name, category:'frete', dirname: image.dirname})
          )
        )
      )
    const freteData = joinFretesWithEachImagesData(fretesImagesLoaded)
    const imagesBase64 = await Promise.all(convertObjectTo64Image(freteData))
    const freteDataWithImagesBase64 = freteData.map((item, index) => ({...item, images: imagesBase64[index]}))
    return freteDataWithImagesBase64
  }
  async postponeDate({freteId, newDate}:PostponeFreteDTO){
    const frete = await this.fretesRepository.findOne({where:{id: freteId}})
    if(frete){
      frete.state = 'Adiada'
      try {
        const newFretePostponed = await this.fretesRepository.create({
          clientId: frete.clientId,
          prices: frete.prices,
          date: new Date(newDate),
          postponed_old_id: frete.id,
        }).save()
        frete.postponed_new_id = newFretePostponed.id
        await frete.save()
        return true
      } catch (e) {
        return e
      }
    }
    return false
  }
  async insertPayment({freteId, type, value}:InsertPaymentDTO){
    const paymentTypes = ['debitPaid', 'creditPaid', 'moneyPaid', 'depositPaid']
    const isValidOptionPaymentType = Number(type) - 1 < paymentTypes.length 
    if(!isValidOptionPaymentType){ return false }
    const frete = await this.fretesRepository.findOne({where:{id: freteId}})
    if(frete){
      frete[paymentTypes[Number(type) - 1]] = Number(value) + Number(frete[paymentTypes[Number(type) - 1]])

      try{
        await frete.save()
      }catch(e){
        console.log(e)
        return false
      }
    }
    return false
  }
  async changeState(idFrete: string, state: IState){
    const frete = await this.fretesRepository.findOne({where:{id: idFrete}})
    if(frete){
      frete.state = state
      try{
        await frete.save();
      }catch(e){
        return false
      }
      return true
    }
    return false 
  }
  async getOne({id}:GetFreteByIdDTO):Promise<any>{
    const frete = await this.fretesRepository.findOne(id,{
      relations:['prices'],
      select:[
        'clientId',
        'date',
        'state',
        'updatedAt',
        'createdAt',
        'postponed_new_id',
        'postponed_old_id',
        'deposit_returned',
        'id',
        'customPrice',
        'creditPaid',
        'debitPaid',
        'depositPaid',
        'discount',
        'moneyPaid',
        'numberOfPeople',
      ],
    })
    if(frete){
      return frete
    }
    return false
  }
  async getBusyDates(busyDatesFreteDTO:BusyDatesFreteDTO):Promise<any>{
    const {fullDate, month, year} = busyDatesFreteDTO
    const initialDate = `${year||new Date().getUTCFullYear()}\\${month || new Date().getMonth() + 1}\\${month ? 1 : new Date().getUTCDate()}`
    const finalDate = (() => {
      let date = new Date(year ? Number(year) : new Date().getUTCFullYear(), month ? Number(month) : 12, 0)
      let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      return `${date.getFullYear()}\\${Number(month) || 12}\\${lastDay}`
    })()
    const fullDateConverted = new Date(fullDate)
    const fretes = await this.fretesRepository.find({
      relations:["client"],
      where: 
        fullDate ? 
          {date: new Date(fullDateConverted.getFullYear(), fullDateConverted.getMonth(), fullDateConverted.getUTCDate())} 
          :
          {date: Between(initialDate, finalDate)},
      select:['date', 'id', 'state', 'boatman', 'client']
    })
    let datesBusy = {}
    let counters:ICounters = {
      'Marcada': 0,
      'Cancelada': 0,
      'Adiada': 0,
      'Confirmada': 0,
      'FretesPerMonth': {},
      'FretesThisWeek': [],
    }
    fretes.map(({state, date, id}) => {
      counters[state]+=1
      let month = months[Number(date.getMonth())]
      if(state !== 'Cancelada' && state !== 'Adiada'){
        counters['FretesPerMonth'][month] ? counters['FretesPerMonth'][month].push(id) : counters['FretesPerMonth'][month] = [id]
        if(date.getMonth() == new Date().getMonth() && (date.getUTCDate() - new Date().getUTCDate()) <= 7){
          counters['FretesThisWeek'].push(id)
        }
      }
     }
    )
    if(fretes){
      fretes.map(({date, id, state, client, boatman})=> {
        const day = String(date.getDate())
        const month = String(date.getMonth()+1)
        const key = `${date.getFullYear()}/${month.length<2 ? "0":""}${month}/${day.length<2 ? "0":""}${day}`
        if(Object.keys(datesBusy).includes(key)){
          datesBusy[key].push({date,id, state, client, boatman})
        }else{
          datesBusy[key] = [{date, id, state, client, boatman}]
        }
      })
      return {dates: datesBusy, counters}
    }
    return false
  }
}