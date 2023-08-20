import { Response } from 'express';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AdTimeZone } from '@prisma/client';

import { AdService } from './ad.service';
import { CreateAdInput } from './dtos/create-ad.dto';
import { UpdateAdInput } from './dtos/update-ad.dto';

@Controller('ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Get('link/:id')
  async countPerformance(@Param('id') id: string, @Res() res: Response) {
    const redirectUrl = await this.adService.countPerformance(id);

    return res.redirect(redirectUrl);
  }

  @Get('occupied')
  async findAll() {
    return this.adService.findAllOccupied();
  }

  @Get('performance/:id')
  async findAllPerformances(@Param('id') id: string) {
    return this.adService.findAllPerformances(id);
  }

  @Get()
  async findAds(
    @Query('lineId') lineId: string,
    @Query('timeZone') timeZone: AdTimeZone,
  ) {
    return this.adService.findManyByLineIdAndTimeZone(lineId, timeZone);
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
