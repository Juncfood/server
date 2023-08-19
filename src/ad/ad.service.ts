import { Injectable } from '@nestjs/common';
import { AdTimeZone, AdType } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { CreateAdInput } from './dtos/create-ad.dto';
import { UpdateAdInput } from './dtos/update-ad.dto';

@Injectable()
export class AdService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllOccupied() {
    return this.prisma.ad.findMany({
      where: {
        occupied: true,
      },
    });
  }

  async findAllPerformances(adId: string) {
    return this.prisma.adPerformance.findMany({
      where: {
        adId,
      },
    });
  }

  async findManyByLineIdAndTimeZone(lineId: string, timeZone: AdTimeZone) {
    return this.prisma.ad.findMany({
      where: {
        lineId,
        timeZone,
      },
    });
  }

  async createAd(body: CreateAdInput) {
    const { type, lineId, timeZone } = body;

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
        timeZone,
        imageUrl: baseImageUrl,
        occupied: true,
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

  async initAds() {
    const lines = await this.prisma.line.findMany();

    for (const line of lines) {
      const { id } = line;

      const adTypes = [
        AdType.DOORSIDELEFT,
        AdType.DOORSIDERIGHT,
        AdType.UPPERSIDE,
      ];

      const timeZones = [
        AdTimeZone.MORNING_RUSH,
        AdTimeZone.MIDTIME,
        AdTimeZone.DINNER_RUSH,
      ];

      const combinations = adTypes.reduce((acc, adType) => {
        const newCombinations = timeZones.map((timeZone) => {
          return {
            adType,
            timeZone,
          };
        });

        return [...acc, ...newCombinations];
      }, []);

      const createManyInputs = combinations.map((combination) => {
        const { adType, timeZone } = combination;

        let baseImageUrl = '';

        switch (adType) {
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

        return {
          type: adType,
          timeZone,
          imageUrl: baseImageUrl,
          occupied: false,
          preoccupied: false,
          lineId: id,
        };
      });

      await this.prisma.ad.createMany({
        data: createManyInputs,
      });
    }

    return true;
  }

  async initAdPerformance() {
    const occupiedAds = await this.prisma.ad.findMany({
      where: {
        occupied: true,
      },
    });

    // make two cpc numbers array for midtime and rush hour
    // rush hour's cpc trends should be lower than midtime
    // but there could be some meeting points between them

    const midtimeCpcNumbers = [
      1500, 1400, 1350, 1440, 1380, 1320, 1420, 1300, 1250, 1320,
    ];
    const rushHourCpcNumbers = [
      1000, 1200, 1350, 1440, 1100, 1300, 1120, 1050, 1150, 1230,
    ];

    const today = new Date();

    // Two ads expected
    for (const ad of occupiedAds) {
      if (ad.timeZone === AdTimeZone.MIDTIME) {
        // make adPerformance based on cpc numbers
        // set dateString in format of YYYY-MM-DD
        // the date should be 10 - x (the index of cpc number) days ago
        // set cpc to the cpc number
        // set adId to the ad's id

        for (const cpc of midtimeCpcNumbers) {
          const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${
            today.getDate() - midtimeCpcNumbers.indexOf(cpc)
          }`;
          await this.prisma.adPerformance.create({
            data: {
              adId: ad.id,
              dateString,
              cpc,
            },
          });
        }
      } else {
        for (const cpc of rushHourCpcNumbers) {
          const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${
            today.getDate() - rushHourCpcNumbers.indexOf(cpc)
          }`;
          await this.prisma.adPerformance.create({
            data: {
              adId: ad.id,
              dateString,
              cpc,
            },
          });
        }
      }
    }

    return true;
  }
}
