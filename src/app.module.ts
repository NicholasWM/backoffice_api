import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { UsersModule } from './users/users.module';
import { ImagesModule } from './images/images.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/typeorm.config';
import { ClientsModule } from './clients/clients.module';
import { FretesModule } from './fretes/fretes.module';
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
    FretesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
