import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { Configuration } from 'src/common/glob/configuration';
import { ErrorCode } from 'src/common/glob/error';
import { TypeOperation } from 'src/common/glob/type/type_operation';
import { LoggerService } from 'src/common/logger.service.ts';
import { Repository } from 'typeorm';

import { CreateRangeSalePointDto } from './dto/create-range-sale-point.dto';
import { UpdateRangeSalePointDto } from './dto/update-range-sale-point.dto';
import { RangeSalePoint } from './entities/range-sale-point.entity';

@Injectable()
export class RangeSalePointService {
    private readonly logger = new Logger('RangeSalePointService');

    constructor(
        @InjectRepository(RangeSalePoint)
        private readonly rangeSalePointRepository: Repository<RangeSalePoint>,

        @Inject(LoggerService)
        private readonly loggerService: LoggerService
    ) { }

    async create(userId: number, createRangeSalePointDto: CreateRangeSalePointDto) {
        try {
            const rangeSalePoint = this.rangeSalePointRepository.create(createRangeSalePointDto);
            await this.rangeSalePointRepository.save(rangeSalePoint);
            this.loggerService.saveRangeSalePointLogger({ id: rangeSalePoint.id, userId, typeOperation: TypeOperation.CREATE, rangeSalePoint });
            return { errorCode: ErrorCode.NONE, rangeSalePoint };
        } catch (error) {
            handleDbExceptions(error, this.logger);
        }
    }

    async findAll(filterDto: FilterDto) {
        try {
            const query = this.rangeSalePointRepository.createQueryBuilder('rsp');

            const { conditions, parameters } = this._buildConditionsAndParameters(filterDto);
            if (conditions.length) {
                query.andWhere(conditions.join(' AND '), parameters);
            }

            query.orderBy('rsp.id', 'DESC');

            const rangeSalePoints = await query.getMany();

            return { errorCode: ErrorCode.NONE, rangeSalePoints }

        } catch (error) {
            handleDbExceptions(error, this.logger);
        }
    }

    async findAllTotal(filterDto: FilterDto) {
        try {
            const query = this.rangeSalePointRepository.createQueryBuilder('rsp');

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

    async getAvailable(filterDto: FilterDto) {
        try {
            const query = this.rangeSalePointRepository.createQueryBuilder('rsp');

            // Filtros dinámicos
            const { conditions, parameters } = this._buildConditionsAndParameters(filterDto);
            if (conditions.length) {
                query.andWhere(conditions.join(' AND '), parameters);
            }

            // SUM de todas las filas filtradas
            const result = await query
                .select('COALESCE(SUM(rsp.sold), 0)', 'availableSum')
                .getRawOne();

            const stock = parseInt(result.availableSum, 10); // total disponible
            const maximum = Configuration.MAXIMO_PUNTO_VENTAS;
            const available = maximum - stock; // máximo que puede comprar todavía

            return {
                errorCode: ErrorCode.NONE,
                maximum,
                stock,
                available
            };

        } catch (error) {
            handleDbExceptions(error, this.logger);
        }
    }

    async findOne(id: number) {
        try {
            const rangeSalePoint = await this.rangeSalePointRepository.findOneBy({ id });
            return { errorCode: ErrorCode.NONE, rangeSalePoint };
        } catch (error) {
            handleDbExceptions(error, this.logger);
        }
    }

    async update(userId: number, id: number, updateRangeSalePointDto: UpdateRangeSalePointDto) {
        try {
            const rangeSalePoint = await this.rangeSalePointRepository.preload({ id, ...updateRangeSalePointDto });
            if (rangeSalePoint) {
                await this.rangeSalePointRepository.save(rangeSalePoint);
                this.loggerService.saveRangeSalePointLogger({ id: rangeSalePoint.id, userId, typeOperation: TypeOperation.UPDATE, rangeSalePoint });
                return { errorCode: ErrorCode.NONE, rangeSalePoint };
            }
        } catch (error) {
            handleDbExceptions(error, this.logger);
        }
    }

    private _buildConditionsAndParameters(filterDto: FilterDto) {
        const { userId, salePointId } = filterDto;
        const conditions: string[] = [];
        const parameters: Record<string, any> = {};

        if (userId) {
            conditions.push('rsp.userId = :userId');
            parameters['userId'] = userId;
        }

        if (salePointId) {
            conditions.push('rsp.salePointId = :salePointId');
            parameters['salePointId'] = salePointId;
        }

        return { conditions, parameters };
    }
}
