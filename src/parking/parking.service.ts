import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { CreateParkingDto } from './dto/create-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { Parking } from './entities/parking.entity';
import { ParkingRepository } from './parking.repository';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(ParkingRepository)
    private parkingRepository: ParkingRepository,
  ){}
  async create(createParkingDto: CreateParkingDto) {
    return await this.parkingRepository.create(createParkingDto).save()
  }

  async getAll(searchParkingDTO) {
    const numberOfResults = 30
    const filters = (() => {
      let keys = Object.keys(searchParkingDTO).filter((item, index)=> item !== 'page')
      let filters = {}
      keys.forEach(key => {
        filters[key] = searchParkingDTO[key]
      })
      return filters
    })()
    return await this.parkingRepository.find({
      where:
        filters,
      skip:
        searchParkingDTO?.page * numberOfResults || 0,
      take:
        numberOfResults
    })
  }

  async update(updateParkingDto: UpdateParkingDto) {
    const valuesToUpdate = {}
    Object.keys(updateParkingDto).forEach(key => {
      if(key !== 'id'){
        valuesToUpdate[key] = updateParkingDto[key]
      }
    })
    await getConnection()
      .createQueryBuilder()
      .update(Parking)
      .set(valuesToUpdate)
      .where("id = :id", { id: updateParkingDto.id })
      .execute();
    
    
  }
}
