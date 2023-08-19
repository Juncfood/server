import { IsString } from 'class-validator';

export class CreateLineInput {
  @IsString()
  name: string;

  @IsString()
  startStationName: string;

  @IsString()
  endStationName: string;
}
