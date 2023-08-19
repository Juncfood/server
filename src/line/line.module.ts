import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { LineController } from './line.controller';
import { LineService } from './line.service';

@Module({
  imports: [],
  controllers: [LineController],
  providers: [LineService, PrismaService],
  exports: [],
})
export class LineModule {}
