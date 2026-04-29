import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/common/logger.module';

import { RangeSalePointTransactionController } from './range-sale-point-transaction.controller';
import { RangeSalePointTransactionService } from './range-sale-point-transaction.service';
import { RangeSalePointTransaction } from 'src/admin/range-sale-point-transaction/entities/range-sale-point-transaction.entity';
import { RangeSalePoint } from 'src/admin/range-sale-point/entities/range-sale-point.entity';
import { CheckboxUser } from 'src/admin/checkbox-user/entities/checkbox-user.entity';

@Module({
    controllers: [RangeSalePointTransactionController],
    providers: [RangeSalePointTransactionService],
    imports: [
        TypeOrmModule.forFeature([RangeSalePointTransaction, RangeSalePoint, CheckboxUser]),
        LoggerModule
    ],
    exports: [RangeSalePointTransactionService]
})
export class RangeSalePointTransactionModule { }
