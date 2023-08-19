import { IsOptional, IsString } from 'class-validator';

export class UpdateAdInput {
  @IsString()
  adId: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
