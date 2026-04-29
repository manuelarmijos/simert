import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse } from 'src/common/decorators/api-standard-response.decorator';
@ApiTags('App')
@ApiBearerAuth('keycloak')
@Controller()
export class AppController {
  @ApiOperation({ summary: 'Application root metadata (name, version, author, architect, url)' })
  @ApiStandardResponse({
    description: 'Application metadata read from package.json',
    data: {
      name: { type: 'string', example: 'parking_simert' },
      version: { type: 'string', example: '1.0.0' },
      url: { type: 'string', example: 'https://clipp.app' },
      author: { type: 'string', example: 'Clipp' },
      architect: { type: 'string', example: 'Clipp Team' },
    },
  })
  @Get()
  getRoot(): object {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const version = packageJson.version;
    const name = packageJson.name;
    const url = packageJson.url;
    const author = packageJson.author;
    const architect = packageJson.architect;
    return {
      "name": name,
      "version": version,
      "url": url,
      "author": author,
      "architect": architect
    };
  }
}