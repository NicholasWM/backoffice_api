import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { UserImagesRepository } from './user-images.repository'
import { FreteImagesRepository } from './frete-images.repository'
import { ParkingImagesRepository } from './parking-images.repository'
@Module({
  imports:[
    TypeOrmModule.forFeature([
      UserImagesRepository,
      FreteImagesRepository,
      ParkingImagesRepository
    ])
  ],
  providers: [ImagesService],
  controllers:[ImagesController],
})
export class ImagesModule {}
