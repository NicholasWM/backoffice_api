import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserImagesRepository } from './user-images.repository';
@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(UserImagesRepository)
    private userImagesRepository:UserImagesRepository,
  ){}

  async imageExists(type, name){
    const types = {
      user: this.userImagesRepository,
    }
    const response = await types[type].find({where:{name}})
    console.log(response.length > 0)
    return response.length > 0
  }
}