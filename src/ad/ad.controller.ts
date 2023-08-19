import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { AdService } from './ad.service';
import { CreateAdInput } from './dtos/create-ad.dto';
import { UpdateAdInput } from './dtos/update-ad.dto';

@Controller('ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Get('line/:lineId')
  async findManyByLineId(@Param('lineId') lineId: string) {
    return this.adService.findManyByLineId(lineId);
  }

  @Post('new')
  async createAd(@Body() body: CreateAdInput) {
    return this.adService.createAd(body);
  }

  @Post('register')
  async registerAd(@Body() body: UpdateAdInput) {
    return this.adService.updateAd(body, true);
  }

  @Post('unregister')
  async deregisterAd(@Body() body: UpdateAdInput) {
    return this.adService.updateAd(body, false);
  }

  @Delete(':id')
  async deleteOneById(@Param('id') id: string) {
    return this.adService.deleteOneById(id);
  }
}
