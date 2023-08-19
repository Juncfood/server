import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateStationInput } from './dtos/create-station.dto';

@Injectable()
export class StationService {
  constructor(private readonly prisma: PrismaService) {}

  async createStation(body: CreateStationInput) {
    return this.prisma.station.create({
      data: {
        ...body,
      },
    });
  }
}
