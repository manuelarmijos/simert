import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RangeSalePoint } from 'src/admin/range-sale-point/entities/range-sale-point.entity';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { LoggerService } from 'src/common/logger.service.ts';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class RangeSalePointService {

  private readonly logger = new Logger(RangeSalePointService.name);

  constructor(
    @InjectRepository(RangeSalePoint)
    private readonly rangeSalePointRepository: Repository<RangeSalePoint>,

    @Inject(LoggerService)
    private readonly loggerService: LoggerService,
  ) { }

  async getRangeSalePointByUserId(userId: number) {
    try {
      const rangeSalePoint = await this.rangeSalePointRepository.findOne({
        where: {
          userId,
          // available: MoreThan(0), // el numero de tarjetas que compro 
          sold: MoreThan(0), // stock disponible
        },
        order: {
          createdAt: 'ASC', // el más antiguo
        },
        select: ['sold','id'], // slect stock disponible
      });

      if(!rangeSalePoint)
        return { rangeSalePoint: {}, errorCode: ErrorCode.NONE };

      return { rangeSalePoint, errorCode: ErrorCode.NONE };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

}
