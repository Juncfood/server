import { Module } from '@nestjs/common';

import { AdModule } from './ad/ad.module';
import { LineModule } from './line/line.module';
import { PrismaService } from './prisma.service';
import { StationModule } from './station/station.module';

@Module({
  imports: [StationModule, LineModule, AdModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
