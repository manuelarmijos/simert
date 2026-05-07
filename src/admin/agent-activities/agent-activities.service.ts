import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { Repository } from 'typeorm';

import { AgentActivity } from './entities/agent-activity.entity';

@Injectable()
export class AgentActivitiesService {

  private readonly logger = new Logger('AgentActivitiesService');

  constructor(
    @InjectRepository(AgentActivity)
    private readonly agentActivityRepository: Repository<AgentActivity>,
  ) { }

  async findAll(filterDto: FilterDto) {
    const { limit = 10, offset = 0 } = filterDto;
    try {
      const { parameters, conditions } = this._buildParametersConditions(filterDto);

      let query = `
        SELECT aa.id, aa."blockId", aa.type,
        TO_CHAR(aa."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS') AS "createdAt",
        aa."userId",
        aa."blockOperatorId",
        b.name AS "blockName"
        FROM agent_activity AS aa
        INNER JOIN block b ON aa."blockId" = b.id
      `;

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      parameters.push(limit, offset);
      const paramLimit = parameters.length - 1;
      const paramOffset = parameters.length;

      query += ` ORDER BY aa.id DESC LIMIT $${paramLimit} OFFSET $${paramOffset};`;

      const agentActivities = await this.agentActivityRepository.query(query, parameters);
      return { errorCode: ErrorCode.NONE, agentActivities };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllTotal(filterDto: FilterDto) {
    try {
      const { parameters, conditions } = this._buildParametersConditions(filterDto);

      let query = `
        SELECT COUNT(*) AS total
        FROM agent_activity AS aa
        INNER JOIN block b ON aa."blockId" = b.id
      `;

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const agentActivities = await this.agentActivityRepository.query(query, parameters);

      return { errorCode: ErrorCode.NONE, total: agentActivities[0].total };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  private _buildParametersConditions(filterDto: FilterDto) {
    const { userId, dateFrom, dateTo } = filterDto;
    const parameters: any[] = [];
    const conditions: string[] = [];

    const addParam = (value: any) => {
      parameters.push(value);
      return `$${parameters.length}`;
    };

    if (userId) {
      conditions.push(`aa."userId" = ${addParam(userId)}`);
    }

    if (dateFrom && dateTo) {
      conditions.push(`aa."createdAt" BETWEEN ${addParam(dateFrom)} AND ${addParam(dateTo)}`);
    }

    return { parameters, conditions };
  }
}
