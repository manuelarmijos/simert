import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonGimModule } from 'src/common/common.gim.module';
import { DinardapAntService } from './dinardap-ant.service';
import { DinardapAntController } from './dinardap-ant.controller';

@Module({
  imports: [ConfigModule, CommonGimModule],
  controllers: [DinardapAntController],
  providers: [DinardapAntService],
  exports: [DinardapAntService],
})
export class DinardapAntModule {}
