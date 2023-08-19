import { IsString } from 'class-validator';

export class UpdateAdInput {
  @IsString()
  adId: string;

  @IsString()
  title: string;

  @IsString()
  imageUrl: string;

  @IsString()
  landingUrl: string;
}
