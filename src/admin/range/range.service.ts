import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { TypeOperation } from 'src/common/glob/type/type_operation';
import { LoggerService } from 'src/common/logger.service.ts';
import { Repository } from 'typeorm';

import { CreateRangeDto } from './dto/create-range.dto';
import { UpdateRangeDto } from './dto/update-range.dto';
import { Range } from './entities/range.entity';

@Injectable()
export class RangeService {

  private readonly logger = new Logger('rangeService');

  constructor(
    @InjectRepository(Range)
    private readonly rangeRepository: Repository<Range>,

    @Inject(LoggerService)
    private readonly loggerService: LoggerService,

  ) { }

  async create(userId: number, createRangeDto: CreateRangeDto) {
    try {
      const query = this.rangeRepository.create({ ...createRangeDto });
      const range = await this.rangeRepository.save(query);
      this.loggerService.saveRangeLogger({ id: range.id, userId: userId, typeOperation: TypeOperation.CREATE, range });

      return { errorCode: ErrorCode.NONE, range }
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async update(userId: number, id: number, updateRangeDto: UpdateRangeDto) {
    try {
      const query = await this.rangeRepository.preload({ id: id, ...updateRangeDto });

      if (!query) {
        throw new Error('Range not found');
      }
      const range = await this.rangeRepository.save(query);
      this.loggerService.saveRangeLogger({ id: range.id, userId: userId, typeOperation: TypeOperation.UPDATE, range });
      return { errorCode: ErrorCode.NONE, range }
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAll(filterDto: FilterDto) {
    try {
      const { limit = 10, offset = 0, search } = filterDto;
      const query = this.rangeRepository.createQueryBuilder('range')
        .select(['range.id', 'range.from', 'range.to', 'range.isActivated',
          'range.createdAt', 'range.updatedAt', 'range.description', 'range.batchNumber', 'range.type', 'range.status', 'range.authorizationDate'])
      if (search) {
        query.andWhere('range.description ILIKE :search', { search: `%${search}%` });
      }
      query.take(limit);
      query.skip(offset);
      query.orderBy('range.id', 'DESC');
      const ranges = await query.getMany();

      return { errorCode: ErrorCode.NONE, ranges };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async verifyRange(filterDto: FilterDto) {
    try {
      const { search, from, to } = filterDto;
      const query = this.rangeRepository.createQueryBuilder('range')
        .select(['range.id', 'range.from', 'range.to'])
        .where(
          `(range."from" ~ '^[0-9]+$' AND range."to" ~ '^[0-9]+$')
            AND (
              (:from >= range.from::bigint AND :from <= range.to::bigint)
              OR
              (:to   >= range.from::bigint AND :to   <= range.to::bigint)
            )`,
          { from, to }
        )
      // .where(`(${from} >= range.from AND ${from} <= range.to) OR (${to} >= range.from AND ${to} <= range.to)`)
      if (search) {
        query.andWhere('range.description ILIKE :search', { search: `%${search}%` });
      }
      const ranges = await query.getMany();

      return { errorCode: ErrorCode.NONE, ranges };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllTotal(filterDto: FilterDto) {
    try {
      const { search } = filterDto;

      let query = `SELECT COUNT(*) AS total FROM public.range r`;
      const conditions: string[] = [];
      const params: any[] = [];

      if (search) {
        params.push(`%${search}%`);
        conditions.push(`r.description ILIKE $${params.length}`);
      }

      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const result = await this.rangeRepository.query(query, params);

      const total = result[0].total;

      return {
        total,
      };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }
}
