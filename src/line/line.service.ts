import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { CreateLineInput } from './dtos/create-line.dto';

@Injectable()
export class LineService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.line.findMany();
  }

  async createLine(body: CreateLineInput) {
    const newLine = await this.prisma.line.create({
      data: {
        ...body,
      },
    });

    return newLine;
  }
}
