import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { TypeOperation } from 'src/common/glob/type/type_operation';
import { LoggerService } from 'src/common/logger.service.ts';
import { Repository } from 'typeorm';

import { L } from '../l/entities/l.entity';
import { CreateSalePointDto } from './dto/create-sale-point.dto';
import { UpdateSalePointDto } from './dto/update-sale-point.dto';
import { SalePoint } from './entities/sale-point.entity';

@Injectable()
export class SalePointService {
  private readonly logger = new Logger('SalePointService');

  constructor(
    @InjectRepository(SalePoint)
    private readonly salePointRepository: Repository<SalePoint>,

    @Inject(LoggerService)
    private readonly loggerService: LoggerService
  ) { }

  async create(userId: number, createSalePointDto: CreateSalePointDto) {
    try {
      const salePoint = this.salePointRepository.create(createSalePointDto);
      await this.salePointRepository.save(salePoint);
      this.loggerService.saveSalePointLogger({ id: salePoint.id, userId, typeOperation: TypeOperation.CREATE, salePoint });
      return { errorCode: ErrorCode.NONE, salePoint };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async existsByUserId(userId: number) {
    try {
      const salePoint = await this.salePointRepository.findOne({
        where: { userId },
        select: ['id']
      });
      return {
        errorCode: ErrorCode.NONE,
        exists: !!salePoint
      };
    } catch (error) {
      this.logger.error(`Error checking if sale point exists for userId ${userId}: ${error.message}`);
      return {
        errorCode: ErrorCode.UNKNOWN,
        exists: false
      };
    }
  }

  async findAll(filterDto: FilterDto) {
    try {
      const query = this.salePointRepository.createQueryBuilder('sp')
        .select([
          'sp.id', 'sp.userId',
          'sp.type', 'sp.mode', 'sp.lt', 'sp.lg', 'sp.title', 'sp.subTitle',
          'sp.alias', 'sp.names', 'sp.number', 'sp.email',
          'sp.countryCode', 'sp.phone',
          'sp.qr', 'sp.isApproved', 'sp.userIdApproved', 'sp.billing_data',
          'z.id', 'z.name',
          'bl.id', 'bl.name'
        ])
        .leftJoin('sp.zone', 'z')
        .leftJoin('sp.block', 'bl')
        .leftJoin(
          (subQuery) => {
            return subQuery
              .select('l_inner.userId', 'userId')
              .addSelect('l_inner.latitude', 'latitude')
              .addSelect('l_inner.longitude', 'longitude')
              .from(L, 'l_inner')
              .distinctOn(['l_inner.userId'])
              .orderBy('l_inner.userId')
              .addOrderBy('l_inner.timestamp', 'DESC');
          },
          'l',
          'l."userId" = sp.userId AND sp.mode = 1',
        )
        .addSelect('l.latitude', 'latitudeMobible')
        .addSelect('l.longitude', 'longitudeMobible');

      const { conditions, parameters } = this._buildConditionsAndParameters(filterDto);
      if (conditions.length) {
        query.andWhere(conditions.join(' AND '), parameters);
      }

      query.orderBy('sp.id', 'DESC');

      const { entities, raw } = await query.getRawAndEntities();

      const salePoints = entities.map((entity, index) => {
        const rawResult = raw[index];
        if (rawResult) {
          (entity as any).latitudeMobible = rawResult.latitudeMobible;
          (entity as any).longitudeMobible = rawResult.longitudeMobible;
        }
        return entity;
      });

      return { errorCode: ErrorCode.NONE, salePoints }

    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllFilter(filterDto: FilterDto) {
    try {
      const { limit = 20, offset = 0 } = filterDto;

      const query = this.salePointRepository.createQueryBuilder('sp')
        .select(['sp.id', 'sp.title', 'sp.subTitle']);

      const { conditions, parameters } = this._buildConditionsAndParameters(filterDto);
      if (conditions.length) {
        query.andWhere(conditions.join(' AND '), parameters);
      }

      query.orderBy('sp.id', 'DESC')
        .take(limit)
        .skip(offset);

      const salePoints = await query.getMany();

      return { errorCode: ErrorCode.NONE, salePoints }

    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllTotal(filterDto: FilterDto) {
    try {
      const query = this.salePointRepository.createQueryBuilder('sp')

      const { conditions, parameters } = this._buildConditionsAndParameters(filterDto);
      if (conditions.length) {
        query.andWhere(conditions.join(' AND '), parameters);
      }

      const total = await query.getCount();

      return { errorCode: ErrorCode.NONE, total }

    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async update(userId: number, id: number, updateSalePointDto: UpdateSalePointDto) {
    try {
      const salePoint = await this.salePointRepository.preload({ id, ...updateSalePointDto });
      if (salePoint) {
        await this.salePointRepository.save(salePoint);
        this.loggerService.saveSalePointLogger({ id: salePoint.id, userId, typeOperation: TypeOperation.UPDATE, salePoint });
        return { errorCode: ErrorCode.NONE, salePoint };
      }
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  private _buildConditionsAndParameters(filterDto: FilterDto) {
    const { userId } = filterDto;
    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    if (userId) {
      conditions.push('sp.userId = :userId');
      parameters['userId'] = userId;
    }

    const { search, zoneId, blockId, isApproved } = filterDto;
    if (search) {
      conditions.push('(sp.title ILIKE :search OR sp.subTitle ILIKE :search OR sp.names ILIKE :search)');
      parameters['search'] = `%${search}%`;
    }

    if (zoneId) {
      conditions.push('sp.zoneId = :zoneId');
      parameters['zoneId'] = zoneId;
    }

    if (blockId) {
      conditions.push('sp.blockId = :blockId');
      parameters['blockId'] = blockId;
    }

    if (isApproved) {
      conditions.push('sp.isApproved = :isApproved');
      parameters['isApproved'] = isApproved;
    }

    return { conditions, parameters };
  }

}
