import { Injectable } from '@nestjs/common';

@Injectable()
export class PortalService {

  findAll() {
    return `This action returns all portal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} portal`;
  }
}
