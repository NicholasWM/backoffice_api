import {TypeOrmModuleOptions} from '@nestjs/typeorm'

export const typeOrmConfig: TypeOrmModuleOptions = {
	type: 'postgres',
	// host: '134.209.113.17',
	host: 'backoffice_db_postgres',
	port: 5432,
	username: 'Nicholas',
	password: 'minhasenha',
	database: 'backoffice_db',
	entities: [__dirname, '../**/*.entity.{js, ts}'],
	synchronize: true,
	logging:false
};
