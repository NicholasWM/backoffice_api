import { PartialType } from '@nestjs/mapped-types';
import { CreateBoatmanDto } from './create-boatman.dto';

export class UpdateBoatmanDto extends PartialType(CreateBoatmanDto) {}
