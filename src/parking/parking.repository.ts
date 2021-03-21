import {EntityRepository, Repository} from "typeorm"
import {Parking} from "./entities/parking.entity"

@EntityRepository(Parking)
export class ParkingRepository extends Repository<Parking>{}