import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { StationController } from './station.controller';
import { StationService } from './station.service';

@Module({
  imports: [],
  controllers: [StationController],
  providers: [StationService, PrismaService],
  exports: [],
})
export class StationModule {}
