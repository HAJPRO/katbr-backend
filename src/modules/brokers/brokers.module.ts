import { Module } from '@nestjs/common';
import { BrokersController } from './brokers.controller.js';
import { BrokersService } from './brokers.service.js';

@Module({
  controllers: [BrokersController],
  providers: [BrokersService],
})
export class BrokersModule {}