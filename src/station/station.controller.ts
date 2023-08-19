import { Body, Controller, Post } from '@nestjs/common';

import { CreateStationInput } from './dtos/create-station.dto';
import { StationService } from './station.service';

@Controller('/station')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Post('/new')
  async createStation(@Body() body: CreateStationInput) {
    return this.stationService.createStation(body);
  }
}
