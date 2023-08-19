import { IsString } from 'class-validator';

export class CreateLineInput {
  @IsString()
  name: string;
}
