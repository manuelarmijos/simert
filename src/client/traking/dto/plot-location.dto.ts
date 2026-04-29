import { IsArray, IsOptional, IsString } from 'class-validator';

export class PlotLocationDto {

    @IsOptional()
    //   time
    //   , cityId
    //   , version
    //   , distanceOnline
    //   , distanceOfline
    //   , vehicleId
    //   , latitude
    //   , longitude
    //   , altitude
    //   , speed
    //   , accuracy
    //   , heading
    //   , statusTracking
    //   , activityTracking
    //   , taken
    //   , gps
    //   , battery
    //   , carrier
    //   , network
    //   , platform
    //   , versionos
    //   , typeconnection
    p: string;

    @IsArray()
    @IsOptional()
    //[ [travelId, status], [travelId, status] ]
    t: any[][];

    @IsString()
    @IsOptional()
    //polyline
    l: string = '';
}