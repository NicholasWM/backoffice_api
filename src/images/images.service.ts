import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserImagesRepository } from './user-images.repository';

interface types {
  
}

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(UserImagesRepository)
    private userImagesRepository:UserImagesRepository,
  ){}

  async imageExists<T>(type, name){
    const types = {
      user: this.userImagesRepository,
    }
    const response:T = await types[type].findOne({where:{name}})
    return {exists: Object.keys(response).length > 0, info: response}
  }
}