import {EntityRepository, Repository} from "typeorm"
import {Boatman} from "./entities/boatman.entity"

@EntityRepository(Boatman)
export class BoatmanRepository extends Repository<Boatman>{}