import { IsString } from 'class-validator';

export class CreateStationInput {
  @IsString()
  name: string;

  @IsString()
  lineId: string;
}
