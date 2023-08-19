import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { AdService } from './ad.service';
import { CreateAdInput } from './dtos/create-ad.dto';
import { UpdateAdInput } from './dtos/update-ad.dto';
import { PreoccupiedQuery } from './queries/preoccupied.query';

@Controller('ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Get('all')
  async findAll() {
    return this.adService.findAllOccupied();
  }

  @Get('preoccupied')
  async findPreoccupiedAds(@Query() query: PreoccupiedQuery) {
    const { lindId, timeZone } = query;

    return this.adService.findManyByLineIdAndTimeZone(lindId, timeZone);
  }

  @Post('new')
  async createAd(@Body() body: CreateAdInput) {
    return this.adService.createAd(body);
  }

  @Post('register')
  async registerAd(@Body() body: UpdateAdInput) {
    return this.adService.updateAd(body);
  }

  @Patch('deregister/:id')
  async deregisterAd(@Param('id') id: string) {
    return this.adService.initAd(id);
  }

  @Delete(':id')
  async deleteOneById(@Param('id') id: string) {
    return this.adService.deleteOneById(id);
  }

  @Get('init')
  async initAds() {
    return this.adService.initAds();
  }

  @Get('init/adPerformance')
  async initAdPerformance() {
    return this.adService.initAdPerformance();
  }
}
