import { EntityRepository, Repository } from 'typeorm'
import { Parking_Image } from './parking-images.entity'
@EntityRepository(Parking_Image)
export class ParkingImagesRepository extends Repository<Parking_Image>{
}