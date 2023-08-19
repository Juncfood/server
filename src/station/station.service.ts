import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateManyStationInput } from './dtos/create-many-station.dto';
import { CreateStationInput } from './dtos/create-station.dto';

@Injectable()
export class StationService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByLineId(lineId: string) {
    return this.prisma.station.findMany({
      where: {
        lineId,
      },
    });
  }

  async createStation(body: CreateStationInput) {
    return this.prisma.station.create({
      data: {
        ...body,
      },
    });
  }

  async createManyStations(body: CreateManyStationInput) {
    const { lineId, stationNames } = body;

    const data = stationNames.split(',').map((name) => ({
      lineId,
      name: name.trim(),
    }));

    return this.prisma.station.createMany({
      data,
    });
  }
}
