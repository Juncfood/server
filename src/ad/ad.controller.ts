import { Body, Controller, Post } from '@nestjs/common';

import { AdService } from './ad.service';
import { CreateAdInput } from './dtos/create-ad.dto';
import { UpdateAdInput } from './dtos/update-ad.dto';

@Controller('/ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Post('/new')
  async createAd(@Body() body: CreateAdInput) {
    return this.adService.createAd(body);
  }

  @Post('/update')
  async updateAd(@Body() body: UpdateAdInput) {
    return this.adService.updateAd(body);
  }
}
