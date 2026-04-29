import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { Repository } from 'typeorm';

import { Physic } from './entities/physic.entity';

@Injectable()
export class PhysicsService {
  private readonly logger = new Logger('PhysicsService');

  constructor(
    @InjectRepository(Physic)
    private readonly physicRepository: Repository<Physic>
  ) { }

  async findAll(filterDto: FilterDto) {
    try {
      const { limit = 20, offset = 0 } = filterDto;

      const query = this.physicRepository.createQueryBuilder('p')
        .select([
          'p.id', 'p.userId', 'p.zoneId', 'p.card',
          'p.time', 'p.checkboxes', 'p.timeByBlock',
          'p.registerAt', 'p.createdAt', 'p.updatedAt'
        ]);

      const { conditions, parameters } = this._buildConditionsAndParameters(filterDto);
      if (conditions.length) {
        query.andWhere(conditions.join(' AND '), parameters);
      }

      query.orderBy('p.id', 'DESC')
        .take(limit)
        .skip(offset);

      const physics = await query.getMany();

      return { errorCode: ErrorCode.NONE, physics };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllTotalUnique(filterDto: FilterDto) {
    try {
      const query = this.physicRepository.createQueryBuilder('p')
        .select('COUNT(DISTINCT p.card)', 'total');

      const { conditions, parameters } = this._buildConditionsAndParameters(filterDto);
      if (conditions.length) {
        query.andWhere(conditions.join(' AND '), parameters);
      }

      const result = await query.getRawOne<{ total: string }>();
      const total = parseInt(result.total, 10);

      return { errorCode: ErrorCode.NONE, total };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllTotal(filterDto: FilterDto) {
    try {
      const query = this.physicRepository.createQueryBuilder('p');

      const { conditions, parameters } = this._buildConditionsAndParameters(filterDto);
      if (conditions.length) {
        query.andWhere(conditions.join(' AND '), parameters);
      }

      const total = await query.getCount();

      return { errorCode: ErrorCode.NONE, total };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  private _buildConditionsAndParameters(filterDto: FilterDto) {
    const { userId, zoneId, search, dateFrom, timeByBlock } = filterDto;
    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    if (userId) {
      conditions.push('p.userId = :userId');
      parameters['userId'] = userId;
    }

    if (zoneId) {
      conditions.push('p.zoneId = :zoneId');
      parameters['zoneId'] = zoneId;
    }

    if (search) {
      conditions.push('p.card ILIKE :search');
      parameters['search'] = `%${search}%`;
    }

    if (dateFrom) {
      conditions.push('DATE(p.registerAt) = :dateFrom');
      parameters['dateFrom'] = dateFrom;
    }

    if (timeByBlock) {
      conditions.push('p.timeByBlock = :timeByBlock');
      parameters['timeByBlock'] = timeByBlock;
    }

    return { conditions, parameters };
  }
}
