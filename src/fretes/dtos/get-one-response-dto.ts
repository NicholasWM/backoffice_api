import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Frete } from '../fretes.entity';

export class GetOneResponseDTO {
    frete?:Frete
    message:String    
}