import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoatmanRepository } from './boatman.repository';
import { CreateBoatmanDto } from './dto/create-boatman.dto';
import { UpdateBoatmanDto } from './dto/update-boatman.dto';

@Injectable()
export class BoatmanService {
  constructor(
    @InjectRepository(BoatmanRepository)
    private boatmanRepository:BoatmanRepository,
  ){}
  async create(createBoatmanDto: CreateBoatmanDto) {
    return await this.boatmanRepository.create(createBoatmanDto).save()
  }

  async findAll() {
    return await this.boatmanRepository.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} boatman`;
  }

  update(id: number, updateBoatmanDto: UpdateBoatmanDto) {
    return `This action updates a #${id} boatman`;
  }

  remove(id: number) {
    return `This action removes a #${id} boatman`;
  }
}
