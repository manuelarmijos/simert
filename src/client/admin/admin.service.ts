import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Slot } from 'src/admin/slot/entities/slot.entity';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { Repository } from 'typeorm';

import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {

  private readonly logger = new Logger('AdminService');

  constructor(
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
  ) { }

  async delete(slotId: number) {
    try {
      await this.slotRepository.delete(slotId);
      return { errorCode: ErrorCode.NONE };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async create(createAdminDto: CreateAdminDto) {
    try {
      const query = this.slotRepository.create({ ...createAdminDto });
      const slot = await this.slotRepository.save(query);
      return { errorCode: ErrorCode.NONE, slot };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

  async findAllSlots(latitude: number, longitude: number) {
    try {
      const slots = await this.slotRepository.createQueryBuilder('sl')
        .select([
          'sl.id', 'sl.slot', 'sl.isActivated', 'sl.lt', 'sl.lg', 'sl.status', 'sl.typeSlot',
          'zone.id', 'zone.name', 'block.id', 'block.name', `earth_distance(ll_to_earth(sl.lt, sl.lg), ll_to_earth(:lat, :lng)) AS distance`
        ])
        .innerJoin("sl.zone", "zone")
        .innerJoin("sl.block", "block")
        .limit(100)
        .orderBy('distance', 'ASC')
        .setParameters({ lat: latitude, lng: longitude })
        .getMany();

      return { errorCode: ErrorCode.NONE, slots };

    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }

}
