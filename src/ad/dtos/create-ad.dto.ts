import { IsEnum, IsString } from 'class-validator';

import { AdTimeZone, AdType } from '@prisma/client';

export class CreateAdInput {
  @IsEnum(AdType)
  type: AdType;

  @IsEnum(AdTimeZone)
  timeZone: AdTimeZone;

  @IsString()
  lineId: string;
}
