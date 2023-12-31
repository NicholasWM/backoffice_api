import {TypeOrmModuleOptions} from '@nestjs/typeorm'

export const typeOrmConfig: TypeOrmModuleOptions = {
	type: 'postgres',
	useUTC:false,
	// host: '134.209.113.17',
	// host: 'localhost',
	// host: 'backoffice_db',
	host: 'backoffice_db_prod',
	port: 5432,
	username: 'Nicholas',
	password: 'minhasenha',
	// database: 'backoffice_pp_dev',
	database: 'backoffice_pp',
	entities: [__dirname, '../**/*.entity.{js, ts}'],
	synchronize: true,
	logging:false
};
