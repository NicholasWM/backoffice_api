import {EntityRepository, Repository} from "typeorm"
import {Frete} from "./fretes.entity"

@EntityRepository(Frete)
export class FreteRepository extends Repository<Frete>{}