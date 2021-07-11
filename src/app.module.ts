import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { UsersModule } from './users/users.module';
import { ImagesModule } from './images/images.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/typeorm.config';
import { ClientsModule } from './clients/clients.module';
import { FretesModule } from './fretes/fretes.module';
import { ContactsModule } from './contacts/contacts.module';
import { PricesModule } from './prices/prices.module';
import { ParkingModule } from './parking/parking.module';
import { PurchasingModule } from './purchasing/purchasing.module';
import { ProductsModule } from './products/products.module';
import { BoatmanModule } from './boatman/boatman.module';
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    MulterModule.register({
      dest: './files',
      limits: { fileSize: 222222222 }
    }),
    UsersModule,
    ImagesModule,
    ClientsModule,
    FretesModule,
    ContactsModule,
    PricesModule,
    ParkingModule,
    PurchasingModule,
    ProductsModule,
    BoatmanModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
