import * as TT from "telegram-typings";
import { TelegramClient } from "src/telegram-client/entities/telegram-client.entity";
import { TelegramUser } from "src/telegram-user/entities/telegram-user.entity";
import { TelegrafContext } from "telegraf/typings/context";
import { UpdateType, MessageSubTypes } from "telegraf/typings/telegram-types";


export interface IGetAllTelegrams {
  clients: TelegramClient[],
  users: TelegramUser[]
}

export interface IConnectToInstance {
  instanceId: string,
  data: {
    first_name?: string,
    telegram_id: number,
    is_bot: boolean,
    language_code?: string,
    last_name?: string,
    username?: string
  }
}
export type ParseVCardResponse = {
  "version": "2.1",
  "fn": "1",
  "tel": {
    "meta": {
      "TYPE": string
    },
    "value": string[]
  }[]
}


export type TOneMonthSchedulingsCallbackRequestText = [ListsActionCallbackName, number, number, string, string, number[]]
export type IDefaultExecuteActionCallbackQueryAction = [ExecuteActionCallbackName, string, number]

export interface IOneMonthSchedulingsCallbackQueryAction {
  ctx: TelegrafContext,
  month: string,
  year: string,
  numberOfResults: number,
  goToPage: number,
  weekdays: string[],
  weekdayIndex: number[],
}

export interface IAllMonthSchedulingsCallbackQueryAction {
  ctx: TelegrafContext,
  month: string,
  year: string,
  numberOfResults: number,
  goToPage: number,
}

export interface IAllSchedulingsRequestsCallbackQueryAction {
  ctx: TelegrafContext,
  action: ListsActionCallbackName,
  numberOfResults: number,
  goToPage: number,
}

export type MessageTypes = 'client' |
  'frete' |
  'freteData' |
  'copyPasteAvailableDates' |
  'daySchedulingsResume' |
  'connectTelegram' |
  'calendarView' |
  'dateOfRequest' |
  'freteLink' |
  'schedulingRequest'

export type IDefaultMessages = {
  [type in Partial<MessageTypes>]: {
    default?: (...params: any) => string;
    noResults?: string
  }
};


export interface ISendActionToAllUsers {
  action: string,
  moreDetails: MessageTypes,
  detailsParams: any[],
  telegram_id: number,
  name: string
}

export type ListsActionCallbackName =
  'ALL_DAYS_OF_MONTH_SCHEDULINGS' |
  'ONE_DAY_OF_MONTH_SCHEDULINGS' |
  'ALL_SCHEDULINGS_REQUESTS' |
  'CANCEL_SCHEDULING'

export type ExecuteActionCallbackName =
  'CANCEL_SCHED' |
  'CONFIRM_SCHED' |
  'BOOK_SCHED' |
  'ONE_SCHED_DETAILS' |
  'ASK_BOOK_SCHED' |
  'CLIENT_DETAILS' |
  'ASK_PRICES_SCHED' |
  'ASK_CANCEL_SCHED' |
  'ASK_CONFIRM_SCHED' |
  'PRICES_SCHED' |
  'ALL_CLIENT_SCHEDULINGS' |
  'RETURN_TO'

export type CBQueryTelegramListActionToFunction = {
  [nome in ListsActionCallbackName]?: (data: TOneMonthSchedulingsCallbackRequestText, ctx: TelegrafContext) => void
}
export type CBQueryTelegramExecuteActionToFunction = {
  [nome in ExecuteActionCallbackName]?: (data: IDefaultExecuteActionCallbackQueryAction, ctx: TelegrafContext) => void
}

export interface IGeneratePaginateActions {
  action: ListsActionCallbackName,
  numberOfResults: number,
  month: string,
  year: string,
  goToPage: number,
  weekday: number[]
}

export type TEntityTypes = 'SCHEDULING'
export interface IGenerateConfirmActions {
  action: ExecuteActionCallbackName,
  targetId: string,
}

export interface MenuResponse {
  [date: string]: {
    message: string;
    handleReplyMarkup: any;
    events?: []
    parameters: {
      [parameter: string]: MenuResponseParameters
    }
  };
}

export type TMatchTypes = 'EXACT' | 'SIMPLE_INCLUDE'

export type TMatchTypesOrder = { [name in TMatchTypes]?: ((ctx: TelegrafContext) => void)[] }
export const MATCH_TYPES_ORDER: TMatchTypes[] = [
  "EXACT",
  "SIMPLE_INCLUDE"
]
export interface KeywordsActionResponse {
  [date: string]: {
    matchType: Partial<TMatchTypes>,
    verifyMatch: (ctx: TelegrafContext, keyword: string) => boolean,
    execute: (ctx: TelegrafContext) => void,
  }
}

export type Middlewares = {
  [updateType in UpdateType]?: {
    [updateSubType in MessageSubTypes | Required<'default'>]?:
    (ctx: TelegrafContext, next: () => Promise<void>) => void;
  };
};

export interface MenuResponseParameters {
  handleMessage: () => any;
  handleReplyMarkup?: () => TT.InlineKeyboardMarkup | TT.ReplyKeyboardMarkup | TT.ReplyKeyboardRemove | TT.ForceReply
}

export type TDaysHifen =
  "Domingo" |
  "Segunda-feira" |
  "Terça-feira" |
  "Quarta-feira" |
  "Quinta-feira" |
  "Sexta-feira" |
  "Sábado" |
  "Dias de semana" |
  "Finais de semana"
