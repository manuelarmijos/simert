import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { Repository } from 'typeorm';

import { CreateIncidentNotificationDto } from './dto/create-incident-notification.dto';
import { UpdateIncidentNotificationDto } from './dto/update-incident-notification.dto';
import { IncidentNotification } from './entities/incident-notification.entity';

@Injectable()
export class IncidentNotificationService {
  private readonly logger = new Logger(IncidentNotificationService.name);
  constructor(
    @InjectRepository(IncidentNotification)
    private readonly incidentNotificationRepository: Repository<IncidentNotification>,
  ) { }

  async create(createIncidentNotificationDto: CreateIncidentNotificationDto) {
    try {
      const incidentNotification = this.incidentNotificationRepository.create({ ...createIncidentNotificationDto });
      return { incidentNotification, errorCode: ErrorCode.NONE };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  findAll() {
    return `This action returns all incidentNotification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} incidentNotification`;
  }

  async update(id: number, updateIncidentNotificationDto: UpdateIncidentNotificationDto) {
    try {
      const incidentNotification = await this.incidentNotificationRepository.preload({ id, ...updateIncidentNotificationDto });
      if (incidentNotification) {
        await this.incidentNotificationRepository.save(incidentNotification);
        return { errorCode: ErrorCode.NONE, incidentNotification };
      }
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} incidentNotification`;
  }
}
