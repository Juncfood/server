import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreateManyStationInput } from './dtos/create-many-station.dto';
import { CreateStationInput } from './dtos/create-station.dto';
import { StationService } from './station.service';

@Controller('station')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Get(':lindId')
  async getManyByLineId(@Param('lineId') lineId: string) {
    return this.stationService.findManyByLineId(lineId);
  }

  @Post('new')
  async createStation(@Body() body: CreateStationInput) {
    return this.stationService.createStation(body);
  }

  @Post('bulk')
  async createManyStations(@Body() body: CreateManyStationInput) {
    return this.stationService.createManyStations(body);
  }
}
