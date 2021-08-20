import { ApiProperty } from '@nestjs/swagger';

export class BusyDatesFreteDTO {
	@ApiProperty({
		default: true,
		required:false,
	})
	busy: boolean;
	
	@ApiProperty({
		default: true,
		required:false,
	})
	pageSelected?: number;

	@ApiProperty({
		default: true,
		required:false,
	})
	numberOfResults?: number;

	@ApiProperty({
		default: true,
		required:false,
	})
	allYearData?: boolean;
	
	@ApiProperty({
		description:'27',
		required:false
	})
  fullDate?:string;
	
	@ApiProperty({
		description:'10',
		required:false
	})
  month?:string;
	
	@ApiProperty({
		description:'2022',
		required:false
	})
  year?: string | null;
}