import { Injectable } from '@nestjs/common';

import { CreateCheckboxUserDto } from './dto/create-checkbox-user.dto';
import { UpdateCheckboxUserDto } from './dto/update-checkbox-user.dto';

@Injectable()
export class CheckboxUserService {
  create(createCheckboxUserDto: CreateCheckboxUserDto) {
    return 'This action adds a new checkboxUser';
  }

  findAll() {
    return `This action returns all checkboxUser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} checkboxUser`;
  }

  update(id: number, updateCheckboxUserDto: UpdateCheckboxUserDto) {
    return `This action updates a #${id} checkboxUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} checkboxUser`;
  }
}
