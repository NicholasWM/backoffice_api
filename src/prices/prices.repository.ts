import {EntityRepository, Repository} from "typeorm"
import {Price} from "./entities/price.entity"

@EntityRepository(Price)
export class PriceRepository extends Repository<Price>{}