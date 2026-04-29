import {
    IsOptional,
    IsString,
} from 'class-validator';

import { CreateIncidentDto } from './create-incident.dto';

export class IncidentDto  extends CreateIncidentDto{
    @IsOptional()
    @IsString()
    createdAt?: string;
}
