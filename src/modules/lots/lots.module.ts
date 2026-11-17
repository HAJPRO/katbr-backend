import { Module } from '@nestjs/common';
import { LotsController } from './lots.controller.js';
import { LotsService } from './lots.service.js';
import { LotsV2Controller } from './lots-v2.controller.js';
import { CacheModule } from '../cache/cache.module.js';
@Module({
  controllers: [LotsController, LotsV2Controller],
  providers: [LotsService],
  imports: [CacheModule]
})
export class LotsModule {}
