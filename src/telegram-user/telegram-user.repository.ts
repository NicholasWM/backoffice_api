import {EntityRepository, Repository} from "typeorm"
import {TelegramUser} from "./entities/telegram-user.entity"

@EntityRepository(TelegramUser)
export class TelegramUserRepository extends Repository<TelegramUser>{}