import { IsString } from 'class-validator';

export class CreateManyStationInput {
  @IsString()
  lineId: string;

  @IsString()
  stationNames: string;
}
