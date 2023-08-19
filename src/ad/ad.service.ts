import { Injectable } from '@nestjs/common';
import { AdType } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { CreateAdInput } from './dtos/create-ad.dto';
import { UpdateAdInput } from './dtos/update-ad.dto';

@Injectable()
export class AdService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByLineId(lineId: string) {
    return this.prisma.ad.findMany({
      where: {
        lineId,
      },
    });
  }

  async createAd(body: CreateAdInput) {
    const { type, lineId } = body;

    let baseImageUrl = '';

    switch (type) {
      case AdType.DOORSIDELEFT:
      case AdType.DOORSIDERIGHT:
        baseImageUrl =
          'https://nwllvhheepuafgifrtlu.supabase.co/storage/v1/object/public/images/doorside.png';
        break;
      default:
        baseImageUrl =
          'https://nwllvhheepuafgifrtlu.supabase.co/storage/v1/object/public/images/upperside.png';
        break;
    }

    const newAd = await this.prisma.ad.create({
      data: {
        type,
        imageUrl: baseImageUrl,
        occupied: false,
        line: {
          connect: {
            id: lineId,
          },
        },
      },
    });

    return newAd;
  }

  async updateAd(body: UpdateAdInput) {
    const { adId, ...data } = body;

    const updatedAd = await this.prisma.ad.update({
      where: {
        id: adId,
      },

      data: {
        ...data,
        occupied: true,
      },
    });

    return updatedAd;
  }

  async initAd(adId: string) {
    let baseImageUrl = '';

    const targetAd = await this.prisma.ad.findUnique({
      where: {
        id: adId,
      },
    });

    switch (targetAd.type) {
      case AdType.DOORSIDELEFT:
      case AdType.DOORSIDERIGHT:
        baseImageUrl =
          'https://nwllvhheepuafgifrtlu.supabase.co/storage/v1/object/public/images/doorside.png';
        break;
      default:
        baseImageUrl =
          'https://nwllvhheepuafgifrtlu.supabase.co/storage/v1/object/public/images/upperside.png';
        break;
    }

    return this.prisma.ad.update({
      where: {
        id: adId,
      },
      data: {
        title: null,
        imageUrl: baseImageUrl,
        occupied: false,
      },
    });
  }

  async deleteOneById(id: string) {
    return this.prisma.ad.delete({
      where: {
        id,
      },
    });
  }
}
