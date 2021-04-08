import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchasingDto } from './create-purchasing.dto';

export class UpdatePurchasingDto extends PartialType(CreatePurchasingDto) {}
