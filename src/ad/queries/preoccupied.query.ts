import { IsEnum, IsString } from 'class-validator';

import { AdTimeZone } from '@prisma/client';

export class PreoccupiedQuery {
  @IsString()
  lindId: string;

  @IsEnum(AdTimeZone)
  timeZone: AdTimeZone;
}
