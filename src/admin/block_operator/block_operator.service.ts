import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockOperator } from 'src/admin/block_operator/entities/block_operator.entity';
import { FilterDto } from 'src/common/dto/filter.dto';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { TypeOperation } from 'src/common/glob/type/type_operation';
import { LoggerService } from 'src/common/logger.service.ts';
import { Repository } from 'typeorm';

import { CreateBlockOperatorDto } from './dto/create-block_operator.dto';
import { FindUniqueUsersBlockOperatorDto } from './dto/find-unique-users-block-operator.dto';
import { UpdateBlockOperatorDto } from './dto/update-block_operator.dto';
@Injectable()
export class BlockOperatorService {
  private readonly logger = new Logger('BlockOperatorService');

  constructor(
    @InjectRepository(BlockOperator)
    private readonly blockOperatorRepository: Repository<BlockOperator>,

    @Inject(LoggerService)
    private readonly loggerService: LoggerService

  ) { }

  async create(userId: number, createBlockOperatorDto: CreateBlockOperatorDto) {
    try {
      const blockOperator = this.blockOperatorRepository.create(createBlockOperatorDto);
      await this.blockOperatorRepository.save(blockOperator);
      this.loggerService.saveBlockOperatorLogger({ id: blockOperator.id, userId, typeOperation: TypeOperation.CREATE, blockOperator });
      return { errorCode: ErrorCode.NONE, blockOperator };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAll(filterDto: FilterDto) {
    const { blockId, date, userId } = filterDto;
    try {
      let blockOperatorsQuery = this.blockOperatorRepository.createQueryBuilder('bo')
        .select([
          'bo.id', 'bo.isActivated', 'bo.userId', 'bo.blockId', 'bo.from', 'bo.to', 'bo.isInitialized', 'bo.isFinalized',
          'bo.dateInitialized', 'bo.dateFinalized'
        ])
        .where('bo.blockId = :blockId', { blockId })
        .andWhere(
          "DATE(bo.from - INTERVAL '5 hours') <= DATE(:date) AND DATE(bo.to - INTERVAL '5 hours') >= DATE(:date)",
          { date },
        );

        if(userId){
          blockOperatorsQuery = blockOperatorsQuery.andWhere('bo.userId = :userId', { userId });
        }

      const blockOperators = await blockOperatorsQuery.getMany();

      return { errorCode: ErrorCode.NONE, blockOperators };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllActiveByUserId(filterDto: FilterDto) {
    const { userId, isInitialized = false, isFinalized = false } = filterDto;
    try {
      const blockOperators = await this.blockOperatorRepository.createQueryBuilder('bo')
        .select([
          'bo.id', 'bo.isActivated', 'bo.userId', 'bo.from', 'bo.to',
          'block.id', 'block.name'
        ])
        .innerJoin('bo.block', 'block')
        .where('bo.userId = :userId', { userId })
        .andWhere('bo.isActivated = :isActivated', { isActivated: true })
        .andWhere('bo.isInitialized = :isInitialized', { isInitialized })
        .andWhere('bo.isFinalized = :isFinalized', { isFinalized })
        .getMany();

      return { errorCode: ErrorCode.NONE, blockOperators };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllByBlockId(filterDto: FilterDto) {
    const { blockId, dateFrom, dateTo } = filterDto;
    try {
      const blockOperatorsQuery = this.blockOperatorRepository.createQueryBuilder('bo')
        .select([
          'bo.id',
          'bo.isActivated',
          'bo.userId',
          'bo.blockId',
          'bo.isInitialized',
          'bo.isFinalized',
          'bo.from',
          'bo.to',
        ])
        .where('bo.blockId = :blockId', { blockId });

      if (dateFrom) {
        blockOperatorsQuery.andWhere('DATE(bo.to) >= DATE(:dateFrom)', { dateFrom });
      }

      if (dateTo) {
        blockOperatorsQuery.andWhere('DATE(bo.from) <= DATE(:dateTo)', { dateTo });
      }

      const blockOperators = await blockOperatorsQuery.getMany();

      return { errorCode: ErrorCode.NONE, blockOperators };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async update(userId: number, id: number, updateBlockOperatorDto: UpdateBlockOperatorDto) {
    try {
      const blockOperator = await this.blockOperatorRepository.preload({ id, ...updateBlockOperatorDto });
      if (blockOperator) {
        await this.blockOperatorRepository.save(blockOperator);
        this.loggerService.saveBlockOperatorLogger({ id: blockOperator.id, userId, typeOperation: TypeOperation.UPDATE, blockOperator });
        return { errorCode: ErrorCode.NONE, blockOperator };
      }
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findUniqueUsers(dto: FindUniqueUsersBlockOperatorDto) {
    const { blockIds, userId } = dto;
    try {
      const query = this.blockOperatorRepository.createQueryBuilder('bo')
        .select('bo.userId', 'userId')
        .addSelect('block.id', 'blockId')
        .addSelect('block.name', 'blockName')
        .addSelect('zone.id', 'zoneId')
        .addSelect('zone.name', 'zoneName')
        .innerJoin('bo.block', 'block')
        .innerJoin('block.zone', 'zone')
        .where(`bo.from <= (NOW() AT TIME ZONE 'America/Guayaquil')`)
        .andWhere(`bo.to >= (NOW() AT TIME ZONE 'America/Guayaquil')`)
        .andWhere('bo.isInitialized = :isInitialized', { isInitialized: true })
        .andWhere('bo.isFinalized = :isFinalized', { isFinalized: false });

      if (blockIds?.length) {
        query.andWhere('bo.blockId IN (:...blockIds)', { blockIds });
      }

      if (userId) {
        query.andWhere('bo.userId = :userId', { userId });
      }

      const raw = await query
        .groupBy('bo.userId')
        .addGroupBy('block.id')
        .addGroupBy('block.name')
        .addGroupBy('zone.id')
        .addGroupBy('zone.name')
        .getRawMany<{ userId: number; blockId: number; blockName: string; zoneId: number; zoneName: string }>();

      return { errorCode: ErrorCode.NONE, users: raw };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async getBlockOperator() {
    try {
      const blockOperators = await this.blockOperatorRepository.find({
        order: { id: 'DESC' }
      });

      const result = blockOperators.map(bo => {
        const name = `${bo.from} - ${bo.to}`;
        return {
          name: name,
          label: name,
          id: bo.id,
          value: bo.id
        };
      });

      return { errorCode: ErrorCode.NONE, blockOperators: result };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }
}
