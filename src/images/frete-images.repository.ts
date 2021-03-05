import { EntityRepository, Repository } from 'typeorm'
import { Frete_Image } from './frete-images.entity'
@EntityRepository(Frete_Image)
export class FreteImagesRepository extends Repository<Frete_Image>{
}