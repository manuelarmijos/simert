import { Controller } from '@nestjs/common';

import { AuthService } from './auth.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Auth')
@ApiBearerAuth('keycloak')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
}