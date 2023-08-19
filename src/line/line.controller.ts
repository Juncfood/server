import { Body, Controller, Post } from '@nestjs/common';

import { CreateLineInput } from './dtos/create-line.dto';
import { LineService } from './line.service';

@Controller('line')
export class LineController {
  constructor(private readonly lineService: LineService) {}

  @Post('new')
  async createLine(@Body() body: CreateLineInput) {
    return this.lineService.createLine(body);
  }
}
