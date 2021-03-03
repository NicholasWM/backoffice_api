import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import {UserImagesRepository} from './user-images.repository'
@Module({
  imports:[
    TypeOrmModule.forFeature([
      UserImagesRepository,
    ])
  ],
  providers: [ImagesService],
  controllers:[ImagesController],
})
export class ImagesModule {}
