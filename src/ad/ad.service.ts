import { createCanvas, loadImage } from 'canvas';
import { parse } from 'node-html-parser';
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

  async countPerformance(adId: string) {
    const ad = await this.prisma.ad.findUnique({
      where: {
        id: adId,
      },
    });

    const today = new Date();

    const dateString = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;

    const todayPerformance = await this.prisma.adPerformance.findFirst({
      where: {
        dateString,
        adId,
      },
    });

    if (!todayPerformance) {
      await this.prisma.adPerformance.create({
        data: {
          adId,
          cpc: 0,
          scanCount: 1,
          dateString,
        },
      });
    } else {
      await this.prisma.adPerformance.update({
        where: {
          id: todayPerformance.id,
        },
        data: {
          scanCount: todayPerformance.scanCount + 1,
        },
      });
    }

    return ad.landingUrl;
  }

  async getAuthToken() {
    const authToken = await this.prisma.authToken.findFirst();

    if (!authToken) {
      throw new Error('Auth token not found');
    }

    return authToken.token;
  }

  async refreshAuthToken() {
    const formData = new URLSearchParams();

    formData.append('username', 'amthetop21@gmail.com');
    formData.append('password', process.env.ESL_AUTH_PASSWORD);

    const { data } = await this.httpService.axiosRef.post(
      'https://stage00.common.solumesl.com/common/token',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const root = parse(data);

    const textArea = root.querySelector('#textarea');

    if (!textArea) {
      throw new Error('Text area not found');
    }

    const token = textArea.innerText;

    await this.prisma.authToken.deleteMany();

    await this.prisma.authToken.create({
      data: {
        token,
      },
    });

    return token;
  }

  async createQrCodeImage(id: string, title: string) {
    const FRAME_WIDTH = 250;
    const FRAME_HEIGHT = 122;
    const QR_CODE_SIZE = 60;
    const TEXT_FONT = '20px Arial';
    const TEXT_MARGIN = 0;

    const qrCodeOptions: qr.QRCodeToDataURLOptions = {
      width: QR_CODE_SIZE,
      margin: 0,
    };

    const url = `https://esl.lucas-gong.dev/ad/link/${id}`;

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

    return canvas.toDataURL().split(',')[1];
  }

  async uploadToEsl(content: string) {
    const ENDPOINT =
      'https://stage00.common.solumesl.com/common/api/v1/labels/contents/image?company=JC09&stationCode=1111';

    const jwtToken = await this.getAuthToken();
    const AUTH_TOKEN = `Bearer ${jwtToken}`;

    const labelIds = [
      '0848A6D0E1D7',
      '0848A6D6E1D1',
      '0848A6D8E1DF',
      '0848A6E2E1D6',
      '0848A70EE1D5',
    ];

    try {
      const labels = labelIds.map((labelId) => ({
        labelCode: labelId,
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
      }));

      await this.httpService.axiosRef.post(
        ENDPOINT,
        {
          labels,
        },
        {
          headers: {
            Authorization: AUTH_TOKEN,
          },
        },
      );
    } catch (e) {
      const message = e.message;
      const isunauthorized = message.includes('401');

      if (isunauthorized) {
        await this.refreshAuthToken();
        return this.uploadToEsl(content);
      } else {
        return false;
      }
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

    const content = await this.createQrCodeImage(updatedAd.id, updatedAd.title);

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
          const currentIdx = midtimeCpcNumbers.indexOf(cpc);

          const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${
            today.getDate() - currentIdx
          }`;
          await this.prisma.adPerformance.create({
            data: {
              adId: ad.id,
              dateString,
              cpc,
              scanCount: 3000 - cpc,
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
              scanCount: 3000 - cpc,
            },
          });
        }
      }
    }

    return true;
  }
}
