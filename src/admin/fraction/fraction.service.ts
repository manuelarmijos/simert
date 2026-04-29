import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dto/filter.dto';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { StatusFraction } from 'src/common/glob/status/status_fraction';
import { Repository } from 'typeorm';

import { Fraction } from './entities/fraction.entity';

@Injectable()
export class FractionService {
  private readonly logger = new Logger('SlotService');

  constructor(
    @InjectRepository(Fraction)
    private readonly fractionRepository: Repository<Fraction>,
  ) { }

  async findAll(filterDto: FilterDto) {
    const { year, month,

      limit = 10, offset = 0 } = filterDto;

    try {
      let tableName = 'fraction';
      let tableExists = false;
      if (year && month) {
        const monthComplite = month.toString().padStart(2, '0')
        tableName = `history.${year}_${monthComplite}_fraction`;
        tableExists = await this._tableExists(tableName);
      }
      if (tableExists || (!year && !month)) {
        const { parameters, conditions } = this.buildParametersConditions(filterDto);
        let query = `
        SELECT f.id, f."userId", f."transactionId", f.time, f."typeFraction",
        f.plate, f.alias, f.tint, f.image, f."createdAt", f."departureDate", f."timeByBlock",
        zone.id AS "zoneId", zone.name AS "zoneName",
        block.id AS "blockId", block.name AS "blockName",
        slot.id AS "slotId", slot.slot AS "slotName", slot."typeSlot"  as "typeSlot", 
        status.id AS "statusId", status.name AS "statusName"
        FROM ${tableName} AS f
        INNER JOIN zone ON f."zoneId" = zone.id
        INNER JOIN block ON f."blockId" = block.id
        INNER JOIN slot ON f."slotId" = slot.id 
        INNER JOIN status ON f."statusId" = status.id`;

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }

        const totalQuery = `SELECT COUNT(*) AS total FROM ${tableName} AS f   INNER JOIN slot ON f."slotId" = slot.id ` + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');
        const totalResult = await this.fractionRepository.query(totalQuery, parameters);
        const total = totalResult[0].total;

        parameters.push(limit, offset);
        const paramLimit = parameters.length - 1;
        const paramOffset = parameters.length;

        query += ` ORDER BY f.id DESC LIMIT $${paramLimit} OFFSET $${paramOffset};`;

        const fractions = await this.fractionRepository.query(query, parameters);

        return {
          fractions,
          total,
          limit,
          offset,
        };
      } else {
        return { fractions: [] };
      }
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllTotalVehicleClientTime(filterDto: FilterDto) {

    const { year, month } = filterDto;
    try {
      let tableName = 'fraction';
      let tableExists = false;
      if (year && month) {
        const monthString = month.toString().padStart(2, '0')
        tableName = `${year}_${monthString}_fraction`;
        tableName = `${tableName}`;
        tableExists = await this._tableExists(tableName);
      }
      if (tableExists || (!year && !month)) {
        const { parameters, conditions } = this.buildParametersConditions(filterDto);
        let query = `
          SELECT
          COUNT(DISTINCT f.plate) AS totalVehicle,
          COUNT(DISTINCT f."userId") AS totalClient,
            TO_CHAR(
      SUM(EXTRACT(EPOCH FROM f.time)) * INTERVAL '1 second',
      'HH24:MI:SS'
    ) AS "totaltime"
          FROM ${tableName} f
          INNER JOIN slot ON f."slotId" = slot.id
        `;

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        const fractions = await this.fractionRepository.query(query, parameters);
        return {
          fractions
        }

      } else {
        return { fractions: [] };
      }
    } catch (error) {
      console.error(`output-> error `, error)
    }
  }

  async findAllTotalOccupationRotationParking(filterDto: FilterDto) {

    const { year, month, zoneId, blockId, slotId } = filterDto;
    try {
      let tableName = 'fraction';
      let tableExists = false;
      if (year && month) {
        const monthString = month.toString().padStart(2, '0')
        tableName = `${year}_${monthString}_fraction`;
        tableName = `${tableName}`;
        tableExists = await this._tableExists(tableName);
      }
      if (tableExists || (!year && !month)) {

        //calculamos el valor de slots
        let queryTotalSlot = `SELECT COUNT(*) AS total FROM slot`;
        let parametersSlot = [];
        const conditionsSlot: string[] = [];

        if (zoneId) {
          conditionsSlot.push(`"zoneId" = $1`);
          parametersSlot.push(zoneId);
        }
        if (blockId) {
          conditionsSlot.push(`"blockId" = $1`);
          parametersSlot.push(blockId);
        }
        if (slotId) {
          conditionsSlot.push(`"slotId" = $1`);
          parametersSlot.push(slotId);
        }

        if (conditionsSlot.length > 0) {
          queryTotalSlot += ' WHERE ' + conditionsSlot.join(' AND ');
        }
        const totalSlot = await this.fractionRepository.query(queryTotalSlot, parametersSlot);
        const total = totalSlot[0].total;

        const { parameters, conditions } = this.buildParametersConditions(filterDto);
        let query = `
          SELECT
            COUNT(*) AS "totalParking",
            TO_CHAR(
                AVG(EXTRACT(EPOCH FROM f.time)) * INTERVAL '1 second',
                'HH24:MI:SS'
            ) AS avgTime,
            COUNT(DISTINCT f."slotId") AS "totalSlotOccupation"
          FROM ${tableName} f
          INNER JOIN slot ON f."slotId" = slot.id
        `;

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
        const fractions = await this.fractionRepository.query(query, parameters);

        if (fractions.length > 0) {
          fractions[0].totalSlot = total;
          fractions[0].occupation = (+fractions[0].totalSlotOccupation * 100 / +total).toFixed(2);
          fractions[0].rotation = (+fractions[0].totalParking / +total).toFixed(2);
        }
        return { fractions }

      } else {
        return { fractions: [] };
      }
    } catch (error) {
      console.error(`output-> error `, error)
    }
  }

  async findAllStatistics(filterDto: FilterDto) {
    const { year, month } = filterDto;
    try {
      let tableName = 'fraction';
      let tableExists = false;
      if (year && month) {
        const monthString = month.toString().padStart(2, '0')
        tableName = `${year}_${monthString}_fraction`;
        tableName = `${tableName}`;
        tableExists = await this._tableExists(tableName);
      }

      if (tableExists || (!year && !month)) {
        const { parameters, conditions } = this.buildParametersConditions(filterDto);
        let query = `
          SELECT z.id AS "idZone", z.name AS "nameZone", b.id AS "idBlock", b.name AS "nameBlock", f.time,
          COUNT(f."zoneId") AS "totalZone",
          COUNT(f."blockId") AS "totalBlock",
          COUNT(f.time) AS "totalTime"

          FROM ${tableName} f
          INNER JOIN "zone" z ON z."id" = f."zoneId"
          INNER JOIN "block" b ON b."id" = f."blockId"
          INNER JOIN "slot" ON f."slotId" = slot.id
          
        `;
        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }

        query += `   GROUP BY     z."id", z.name,    b."id", b.name, f.time ; `;
        const fractions = await this.fractionRepository.query(query, parameters);
        return {
          fractions
        }
      } else {
        return { fractions: [] };
      }
    } catch (error) {
      handleDbExceptions(error, this.logger);

    }
  }

  private async _tableExists(tableName: string): Promise<boolean> {
    const names = tableName.split('.');
    if (names.length <= 1) {
      this.logger.error(`No se especificó el esquema en la tabla ${tableName}`);
      return false;
    }

    const table_schema: string = names[0];
    const table_name: string = names[1];

    const query = `
    SELECT EXISTS(
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = $1
        AND table_name = $2
    ) AS "exists";
  `;

    try {
      const result = await this.fractionRepository.query(query, [table_schema, table_name]);
      return result[0].exists;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async findStatisticsFractions(filterDto: FilterDto) {

    try {

      const { year, month } = filterDto;
      let tableName = 'public.fraction';
      let tableExists = false;
      const schema = 'history';
      if (year && month) {
        const monthString = month.toString().padStart(2, '0')
        let tableNameAux = `${schema}."${year}_${monthString}_fraction"`;
        tableExists = await this._tableExists(tableNameAux);
        if (tableExists)
          tableName = tableNameAux;
      }

      const { parameters, conditions } = this.buildParametersConditions(filterDto);

      let query = `
              SELECT
                TO_CHAR(f."createdAt", 'YYYY-MM-DD') AS date,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.REQUESTED} THEN 1 END) AS requested,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.RESERVERD} THEN 1 END) AS reserved,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.ACTIVE} THEN 1 END) AS active,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.INCREMENTED} THEN 1 END) AS incremented,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.FINISHED_BY_OPERATOR} THEN 1 END) AS finished_by_operator,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.NEXT_TO_EXCEEDED_TIME} THEN 1 END) AS next_to_exceeded,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.EXCEEDED_TIME} THEN 1 END) AS exceeded_time,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.SANCTIONED} THEN 1 END) AS sanctioned,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.CANCELED} THEN 1 END) AS canceled,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.FINISHED} THEN 1 END) AS finish,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.FINISHED_BY_INCREMENT} THEN 1 END) AS finished_by_increment,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.FINISHED_BY_CONTROLLER} THEN 1 END) AS finished_by_controller,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.RATED_CLIENT} THEN 1 END) AS rated_client,
                COUNT(CASE WHEN f."statusId" = ${StatusFraction.ERROR} THEN 1 END) AS error
              FROM ${tableName} f
      `;

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ` GROUP BY TO_CHAR(f."createdAt", 'YYYY-MM-DD') ORDER BY date;`;

      const fractions = await this.fractionRepository.query(query, parameters);

      if (fractions.length === 0)
        return { errorCode: ErrorCode.NOT_FOUND, message: 'No se encontraron resultados' };
      return { errorCode: ErrorCode.NONE, message: 'Resultados encontrados', fractions };

    } catch (error) {
      handleDbExceptions(error, this.logger);
    }

  }

  buildParametersConditions = (filterDto) => {
    const {
      typeFraction,
      zoneId,
      blockId,
      slotId,
      statusId,
      search,
      isTimeZone,
      dateFrom,
      typeSlot,
      dateTo,
      timeZoneUTC,
      fromCreatedAt,
      toCreatedAt,
      userId
    } = filterDto;

    const conditions: string[] = [];
    const parameters: any[] = [];

    // Función auxiliar para numerar placeholders
    const addParam = (value: any) => {
      parameters.push(value);
      return `$${parameters.length}`;
    };

    if (search) {
      conditions.push(`f."plate" = ${addParam(search)}`);
    }

    if (statusId) {
      conditions.push(`f."statusId" = ${addParam(statusId)}`);
    }

    if (typeFraction) {
      conditions.push(`f."typeFraction" = ${addParam(typeFraction)}`);
    }

    if (zoneId) {
      conditions.push(`f."zoneId" = ${addParam(zoneId)}`);
    }

    if (blockId) {
      conditions.push(`f."blockId" = ${addParam(blockId)}`);
    }

    if (slotId) {
      conditions.push(`f."slotId" = ${addParam(slotId)}`);
    }

    if (userId) {
      conditions.push(`f."userId" = ${addParam(userId)}`);
    }

    if (typeSlot) {
      conditions.push(`slot."typeSlot" = ${addParam(Number(typeSlot))}`);
    }

    if (isTimeZone) {
      if (fromCreatedAt && toCreatedAt && timeZoneUTC) {
        conditions.push(
          `f."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${addParam(timeZoneUTC)} BETWEEN ${addParam(fromCreatedAt)} AND ${addParam(toCreatedAt)}`
        );
      }
    } else {
      if (dateFrom && dateTo) {
        conditions.push(`DATE(f."register") BETWEEN ${addParam(dateFrom)} AND ${addParam(dateTo)}`); //TEMPORAL VER si se envia la hora
      }
    }

    return { parameters, conditions };
  };

}
