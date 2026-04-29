import { IsOptional, IsString, MaxLength } from "class-validator";

export class GetClientGimDto {

    @IsString()
    identificationNumber: string;

}

export class GetClientGimByCitationDto {

    @IsString()
    identityCard: string;

    @IsOptional()
    @IsString()
    @MaxLength(250)
    nroTicket?: string;
    
}