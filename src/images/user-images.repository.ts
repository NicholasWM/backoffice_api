import { EntityRepository, Repository } from 'typeorm'
import { User_Image } from './user-images.entity'
@EntityRepository(User_Image)
export class UserImagesRepository extends Repository<User_Image>{
}