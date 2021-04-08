import { Injectable } from '@nestjs/common';
import { CreatePurchasingDto } from './dto/create-purchasing.dto';
import { UpdatePurchasingDto } from './dto/update-purchasing.dto';

@Injectable()
export class PurchasingService {
  create(createPurchasingDto: CreatePurchasingDto) {
    return 'This action adds a new purchasing';
  }

  findAll() {
    return `This action returns all purchasing`;
  }

  findOne(id: number) {
    return `This action returns a #${id} purchasing`;
  }

  update(id: number, updatePurchasingDto: UpdatePurchasingDto) {
    return `This action updates a #${id} purchasing`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchasing`;
  }
}
