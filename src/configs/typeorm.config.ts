import {TypeOrmModuleOptions} from '@nestjs/typeorm'

export const typeOrmConfig: TypeOrmModuleOptions = {
	type: 'postgres',
	// host: '134.209.113.17',
	host: 'localhost',
	port: 5432,
	username: 'Nicholas',
	password: 'minhasenha',
	database: 'backoffice_pp_dev',
	// database: 'backoffice_pp',
	entities: [__dirname, '../**/*.entity.{js, ts}'],
	synchronize: true,
	logging:false
};
