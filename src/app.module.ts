import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdModule } from './ad/ad.module';
import { LineModule } from './line/line.module';
import { PrismaService } from './prisma.service';
import { StationModule } from './station/station.module';

@Module({
  imports: [StationModule, LineModule, AdModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
