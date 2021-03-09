import {EntityRepository, Repository} from "typeorm"
import {Frete} from "./fretes.entity"

@EntityRepository(Frete)
export class FretesRepository extends Repository<Frete>{}