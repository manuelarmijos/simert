import { Injectable,Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { Repository } from 'typeorm';

import { FractionStatus } from './entities/fraction_status.entity';
@Injectable()
export class FractionStatusService {
    private readonly logger = new Logger('FractionStatusService');
    constructor(
        @InjectRepository(FractionStatus)
        private readonly fractionStatusRepository: Repository<FractionStatus>,
    
    ) { }

    async findAllFractionState(fractionId,filterDto:FilterDto) {
      const {year,month}=filterDto;
        try {
          let tableName = `fraction_status`;
          if(year&&month){
            tableName = `${year}_${month}_fraction_status`;
          }
          const query =`
            SELECT fs.id,
            fs.moment,
            TO_CHAR(fs."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS') AS "createdAt",
            s.name as statusLabel
            FROM ${tableName} AS fs
            INNER JOIN status s ON s.id=fs."statusId" 
            WHERE fs."fractionId" =  ${fractionId} 
          `;
          const fractionStatus =await this.fractionStatusRepository.query(query);
          return { fractionStatus };
        } catch (error) {
          handleDbExceptions(error, this.logger);
        }
      }
}        
