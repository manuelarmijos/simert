import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { FilterDto } from 'src/common/dto/filter.dto';

export class IncidentFilterDto extends FilterDto {
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsBoolean()
  filterWhitRangeDays?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  incidentTypeId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  statusIncident?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  blockOperatorId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  incidentCategory?: number;
}
