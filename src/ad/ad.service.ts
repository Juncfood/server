import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';
import * as qr from 'qrcode';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AdTimeZone, AdType } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { CreateAdInput } from './dtos/create-ad.dto';
import { UpdateAdInput } from './dtos/update-ad.dto';

@Injectable()
export class AdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async createQrCodeImage(url: string, title: string) {
    const FRAME_WIDTH = 250;
    const FRAME_HEIGHT = 122;
    const QR_CODE_SIZE = 60;
    const TEXT_FONT = '14px Arial';
    const TEXT_MARGIN = 5;

    const qrCodeOptions: qr.QRCodeToDataURLOptions = {
      width: QR_CODE_SIZE,
      margin: 0,
    };
    const qrCodeDataUrl = await qr.toDataURL(url, qrCodeOptions);

    const canvas = createCanvas(FRAME_WIDTH, FRAME_HEIGHT);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

    const qrCodeImage = await loadImage(qrCodeDataUrl);
    const qrCodeX = (FRAME_WIDTH - QR_CODE_SIZE) / 2;
    const qrCodeY = (FRAME_HEIGHT - QR_CODE_SIZE) / 2 - 10;
    ctx.drawImage(qrCodeImage, qrCodeX, qrCodeY);

    ctx.fillStyle = 'black';
    ctx.font = TEXT_FONT;
    ctx.textAlign = 'center';
    const textX = FRAME_WIDTH / 2;
    const textY = qrCodeY + QR_CODE_SIZE + TEXT_MARGIN + 20; // 텍스트의 높이를 고려하여 조절
    ctx.fillText(title, textX, textY);

    const outputStream = fs.createWriteStream('./qr-code.png');
    const pngStream = canvas.createPNGStream();
    pngStream.pipe(outputStream);
    outputStream.on('finish', () => {
      console.log('Image saved:', './qr-code.png');
      const base64Data = canvas.toDataURL().split(',')[1];
      console.log('Base64 Image:', base64Data);
    });

    return canvas.toDataURL().split(',')[1];
  }

  async uploadToEsl(content: string) {
    const ENDPOINT =
      'https://stage00.common.solumesl.com/common/api/v1/labels/contents/image?company=JC09&stationCode=1111';
    const AUTH_TOKEN =
      'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsiLCJ0eXAiOiJKV1QifQ.eyJpZHAiOiJMb2NhbEFjY291bnQiLCJvaWQiOiI0NGU2ZDdkZS1hYmUwLTRkMWItYjI3Yi00YTliZDA1OTQzNGEiLCJzdWIiOiI0NGU2ZDdkZS1hYmUwLTRkMWItYjI3Yi00YTliZDA1OTQzNGEiLCJuYW1lIjoiYW10aGV0b3AyMSIsIm5ld1VzZXIiOmZhbHNlLCJleHRlbnNpb25fQWRtaW5BcHByb3ZlZCI6dHJ1ZSwiZXh0ZW5zaW9uX0N1c3RvbWVyQ29kZSI6IkpDMDkiLCJleHRlbnNpb25fQ3VzdG9tZXJMZXZlbCI6IjEiLCJlbWFpbHMiOlsiYW10aGV0b3AyMUBnbWFpbC5jb20iXSwidGZwIjoiQjJDXzFfUk9QQ19BdXRoIiwiYXpwIjoiZTA4ZTU0ZmYtNWJiMS00YWU3LWFmZGUtYjljZGM4ZmEyM2FlIiwidmVyIjoiMS4wIiwiaWF0IjoxNjkyNDUyMzcyLCJhdWQiOiJlMDhlNTRmZi01YmIxLTRhZTctYWZkZS1iOWNkYzhmYTIzYWUiLCJleHAiOjE2OTI1Mzg3NzIsImlzcyI6Imh0dHBzOi8vc29sdW1iMmMuYjJjbG9naW4uY29tL2IwYzhlM2Q5LTA4ZmEtNDg3YS1hZmYxLTg1YmFlMTFmYzZjNS92Mi4wLyIsIm5iZiI6MTY5MjQ1MjM3Mn0.Duw3AdDATjLQTL1f9jItig6Q1ars2l5qirvFJXk3VyFXChNqYvu2INSoRx36Q3MX5UmF2u6JTpdaSlZfK0RO946waffiaD0ssN1LVAsrGYSQHQwgN2lDvlIieiuriS23wF0RVuV9yHd4XbhOrc1JilbHCJ6XBgMCYPBCgJVpLTIcxBPxer10neGJG95Z4rcZt7YG1cFn3k-oAkzVvzt7MMpo61_e-6JxaKQwYKyH0nB_zjt1gqwXhaAlhil3FlkLe0k_5kZFc7Ap-RFVem1nzlsc_xfE_wHC38v7qokged-HnKsOjs9Hzt7KfCSTDv6iHixmG3vUSoRR1SAoJSJcLw';

    try {
      await this.httpService.axiosRef.post(
        ENDPOINT,
        {
          labels: [
            {
              labelCode: '0848A6D6E1D1',
              frontPage: 1,
              articleList: [
                {
                  articleId: 'B100001',
                  articleName: 'OAP DISPENSER LARGE',
                  nfcUrl: 'http://www.solumesl.com',
                  data: {
                    ARTICLE_ID: 'B100001',
                    ARTICLE_NAME: 'OAP DISPENSER LARGE',
                    NFC_URL: 'http://www.solum.com/p/B100001',
                    SALE_PRICE: '$100',
                    DISCOUNT_PRICE: '$90',
                  },
                },
              ],
              contents: [
                {
                  contentType: 'image',
                  imgBase64: content,
                  pageIndex: 1,
                  skipChecksumValidation: true,
                },
              ],
            },
          ],
        },
        {
          headers: {
            Authorization: AUTH_TOKEN,
          },
        },
      );
    } catch (e) {
      console.log(e);
      return false;
    }

    return true;
  }

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

    const content = await this.createQrCodeImage(
      updatedAd.landingUrl,
      updatedAd.title,
    );

    const success = await this.uploadToEsl(content);

    if (!success) {
      throw new Error('Failed to upload to ESL');
    }

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
