import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Physic } from './entities/physic.entity';
import { PhysicsController } from './physics.controller';
import { PhysicsService } from './physics.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PhysicsController],
  providers: [PhysicsService],
  imports: [TypeOrmModule.forFeature([Physic]), AuthModule],
})
export class PhysicsModule { }
