import { Controller } from '@nestjs/common';
import { IncidentPaymentService } from './incident-payment.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Admin - Incident Payment')
@ApiBearerAuth('keycloak')
@Controller('admin/incident-payment')
export class IncidentPaymentController {
  constructor(private readonly incidentPaymentService: IncidentPaymentService) {}
}
