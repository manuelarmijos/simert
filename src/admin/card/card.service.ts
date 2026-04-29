import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { TypeOperation } from 'src/common/glob/type/type_operation';
import { LoggerService } from 'src/common/logger.service.ts';
import { Repository } from 'typeorm';

import { FilterDto } from '../../common/dto/filter.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';

@Injectable()
export class CardService {
  private readonly logger = new Logger('CardService');

  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,

    @Inject(LoggerService)
    private readonly loggerService: LoggerService,
  ) { }

  async create(userId: number, createCardDto: CreateCardDto) {
    try {
      let card = this.cardRepository.create({ ...createCardDto });
      card = await this.cardRepository.save(card);
      this.loggerService.saveCardLogger({
        id: card.id,
        userId,
        typeOperation: TypeOperation.CREATE,
        card,
      });
      return { card };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAll(filterDto: FilterDto) {
    const { search } = filterDto;

    // Asegura números para paginación (evita "syntax error at or near '3'")
    const take = Number(filterDto.limit) || 20;
    const skip = Number(filterDto.offset) || 0;

    try {
      const query = this.cardRepository
        .createQueryBuilder('c')
        .select([
          'c.id',
          'c.name',
          'c.price',
          'c.commission',
          'c.checkboxes',
          'c.isActivated',
        ])
        .orderBy('c.id', 'DESC')
        .take(take)
        .skip(skip);

      if (search) {
        query.andWhere('c.name ILIKE :search', { search: `%${search}%` });
      }

      const card = await query.getMany();

      return { card, offset: skip, limit: take };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllTotal(filterDto: FilterDto) {
    const { search } = filterDto;

    try {
      const query = this.cardRepository.createQueryBuilder('c');

      if (search) {
        query.andWhere('c.name ILIKE :search', { search: `%${search}%` });
      }

      const total = await query.getCount();
      return { total };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async update(id: number, updateCardDto: UpdateCardDto) {
    try {
      const card = await this.cardRepository.preload({ id, ...updateCardDto });
      if (card) {
        await this.cardRepository.save(card);
        this.loggerService.saveCardLogger({ id: card.id, typeOperation: TypeOperation.UPDATE, card });
        return { card };
      }
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }
}
