import { Module } from '@nestjs/common';
import { IncidentPaymentService } from './incident-payment.service';
import { IncidentPaymentController } from './incident-payment.controller';

@Module({
  controllers: [IncidentPaymentController],
  providers: [IncidentPaymentService],
})
export class IncidentPaymentModule {}
