import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';

const schedulerTime = 2;
@Injectable()
export class ScheduleService {
  constructor() {}

  async onApplicationBootstrap() {}
  @Cron(`*/${schedulerTime} * * * * *`)
  // @Timeout(2000)
  async test() {
    console.log('Sheduler running');
  }
}
