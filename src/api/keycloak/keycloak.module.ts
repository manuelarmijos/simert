import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonGimModule } from 'src/common/common.gim.module';

import { KeycloakController } from './keycloak.controller';
import { KeycloakService } from './keycloak.service';

@Module({
  imports: [ConfigModule, CommonGimModule],
  controllers: [KeycloakController],
  providers: [KeycloakService],
  exports: [KeycloakService],
})
export class KeycloakModule {}
