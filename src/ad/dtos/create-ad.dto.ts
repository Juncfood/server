import { IsEnum, IsString } from 'class-validator';

import { AdType } from '@prisma/client';

export class CreateAdInput {
  @IsEnum(AdType)
  type: AdType;

  @IsString()
  lineId: string;
}
