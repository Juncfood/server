import { Body, Controller, Get, Post } from '@nestjs/common';

import { CreateLineInput } from './dtos/create-line.dto';
import { LineService } from './line.service';

@Controller('line')
export class LineController {
  constructor(private readonly lineService: LineService) {}

  @Get('all')
  async getLines() {
    return this.lineService.getAll();
  }

  @Post('new')
  async createLine(@Body() body: CreateLineInput) {
    return this.lineService.createLine(body);
  }
}
