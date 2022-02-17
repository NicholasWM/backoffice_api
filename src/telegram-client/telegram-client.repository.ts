import {EntityRepository, Repository} from "typeorm"
import {TelegramClient} from "./entities/telegram-client.entity"

@EntityRepository(TelegramClient)
export class TelegramClientRepository extends Repository<TelegramClient>{}