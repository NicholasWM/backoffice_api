import {IsEmail, IsNotEmpty, MaxLength, IsPhoneNumber} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { IContact } from '../types';

export class FindClientByContactDTO {
  @ApiProperty({
		default: [{
			desc:  'WhatsApp',
			info:  '13999999',
			clientID: ''
		}]
	})
	contacts: Array<IContact>;

}