import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';

@Module({
  imports: [],
  controllers: [AdController],
  providers: [AdService, PrismaService],
  exports: [],
})
export class AdModule {}
