import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { TypeOperation } from 'src/common/glob/type/type_operation';
import { LoggerService } from 'src/common/logger.service.ts';
import { Repository } from 'typeorm';

import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';

@Injectable()
export class ScheduleService {

  private readonly logger = new Logger('ScheduleService');

  constructor(

    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,

    @Inject(LoggerService)
    private readonly loggerService: LoggerService,
  ) { }

  async create(userId: number, createScheduleDto: CreateScheduleDto) {
    try {
      createScheduleDto.dataSchedules.forEach((element) => {
        const blockSchedule = this.scheduleRepository.create({ ...element });
        this.scheduleRepository.save(blockSchedule);
        this.loggerService.saveScheduleBlockLogger({ id: blockSchedule.id, userId, typeOperation: TypeOperation.CREATE, blockSchedule });
      });
      return { errorCode: ErrorCode.NONE };

    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllScheduleByBlock(blockId: number) {
    try {
      const blockSchedule = await this.scheduleRepository.createQueryBuilder('sc')
        .select([
          'sc.id', 'sc.isActivated', 'sc.dayOfWeekInit',
          'sc.dayOfWeekEnd', 'sc.openingTime', 'sc.closingTime'
        ])
        .where('sc.blockId = :blockId', { blockId })
        .orderBy('sc.dayOfWeekInit', 'ASC')
        .getMany();

      if (blockSchedule.length > 0)
        return { errorCode: ErrorCode.NONE, blockSchedule };
      return { errorCode: ErrorCode.NOT_FOUND }

    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async updateActive(userId: number, id: number, updateScheduleDto: UpdateScheduleDto) {
    try {
      const blockSchedule = await this.scheduleRepository.preload({ id, ...updateScheduleDto });
      if (blockSchedule) {
        await this.scheduleRepository.save(blockSchedule);
        this.loggerService.saveScheduleBlockLogger({ id: blockSchedule.id, userId, typeOperation: TypeOperation.UPDATE, blockSchedule });
        return { errorCode: ErrorCode.NONE, blockSchedule };
      } else return { errorCode: ErrorCode.NOT_FOUND };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async update(userId: number, updateScheduleDto: UpdateScheduleDto) {
    try {
      updateScheduleDto.dataSchedules.forEach(async (schedule) => {
        const { id } = schedule;
        const blockSchedule = await this.scheduleRepository.preload({ id, ...schedule });
        if (blockSchedule) {
          this.scheduleRepository.save(blockSchedule);
          this.loggerService.saveScheduleBlockLogger({ id: blockSchedule.id, userId, typeOperation: TypeOperation.UPDATE, blockSchedule });
        }
      });
      return { errorCode: ErrorCode.NONE }
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

}
