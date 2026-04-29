import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupportTicket } from 'src/admin/support-ticket/entities/support-ticket.entity';
import handleDbExceptions from 'src/common/exceptions/error.db.exception';
import { ErrorCode } from 'src/common/glob/error';
import { SupportTicketStatus } from 'src/common/glob/type/support_ticket_status';
import { Repository } from 'typeorm';

import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';

@Injectable()
export class SupportTicketService {
  private readonly logger = new Logger(SupportTicketService.name);

  constructor(
    @InjectRepository(SupportTicket)
    private readonly supportTicketRepository: Repository<SupportTicket>,
  ) { }

  async create(userId: number, createSupportTicketDto: CreateSupportTicketDto) {
    try {
      // Asignar userId si viene en el DTO o usar el del parámetro
      if (!createSupportTicketDto.userId) {
        createSupportTicketDto.userId = userId;
      }

      // Si no se especifica status, usar PENDING por defecto
      if (!createSupportTicketDto.status) {
        createSupportTicketDto.status = SupportTicketStatus.PENDING;
      }

      const supportTicket = this.supportTicketRepository.create({
        ...createSupportTicketDto,
      });

      const savedTicket = await this.supportTicketRepository.save(supportTicket);

      // Generar número de ticket de referencia
      const ticketNumber = `ST-${savedTicket.id.toString().padStart(6, '0')}`;

      return {
        errorCode: ErrorCode.NONE,
        supportTicket: savedTicket,
        ticketNumber,
        message: `Ticket creado exitosamente. Número de referencia: ${ticketNumber}`,
      };
    } catch (error) {
      handleDbExceptions(error, this.logger);
    }
  }
}
