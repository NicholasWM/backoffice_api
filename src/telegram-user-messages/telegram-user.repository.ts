import {EntityRepository, Repository} from "typeorm"
import {TelegramUserMessage} from "./entities/telegram-user-message.entity"

@EntityRepository(TelegramUserMessage)
export class TelegramUserMessageRepository extends Repository<TelegramUserMessage>{}