import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from "@nestjs/config"
import { FretesService } from 'src/fretes/fretes.service';
import { Middleware, Telegraf } from 'telegraf'
import * as TT from "telegram-typings";
import { convertCodesOfEmojisInEmojis, generateOptions, getPagination, makeLinks, startOptions } from './helpers'
import { formatString } from '../utils/regex'
import { dateMonthDayYearWrited, dateMonthYearWrited } from '../utils/dateHelper'
import { ClientsService } from 'src/clients/clients.service';
import { GetBusyDatesResponse } from 'src/fretes/interfaces';
import { IContact } from 'src/clients/types';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramUserRepository } from 'src/telegram-user/telegram-user.repository';
import { TelegramClientRepository } from 'src/telegram-client/telegram-client.repository';
import { TelegramUserService } from 'src/telegram-user/telegram-user.service';
import { TelegramUserMessageRepository } from 'src/telegram-user-messages/telegram-user.repository';
import { InlineKeyboardButton, MessageSubTypes, UpdateType } from 'telegraf/typings/telegram-types';
import { Not } from 'typeorm';
import { PricesService } from 'src/prices/prices.service';
import { Client } from 'src/clients/clients.entity';
import { Contact } from 'src/contacts/entities/contact.entity';
import { parseVCard } from './types';
import { DatesBusy, DateBusy } from 'src/fretes/interfaces';
import { Frete } from 'src/fretes/fretes.entity';
import { Boatman } from 'src/boatman/entities/boatman.entity';
import { TelegrafContext } from 'telegraf/typings/context';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { IState } from 'src/fretes/types';

const daysHifen = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Dias de semana",
  "Finais de semana",
]

interface MenuResponseParameters {
  handleMessage: () => any;
  handleReplyMarkup?: () => TT.InlineKeyboardMarkup | TT.ReplyKeyboardMarkup | TT.ReplyKeyboardRemove | TT.ForceReply
}

type IEventTelegram = {
  name: string, condition: Function
}
// interface ITelegramEvent{

// }
// class TelegramEvent implements ITelegramEvent{
//   private name: string
//   private condition: Function
//   constructor({name, condition}: IEventTelegram){
//     this.name = name
//     this.condition = condition
//   }
// }


type MessageTypes = 'client' |
  'frete' |
  'freteData' |
  'copyPasteAvailableDates' |
  'daySchedulingsResume' |
  'connectTelegram' |
  'calendarView' |
  'dateOfRequest' |
  'freteLink' |
  'schedulingRequest'

type IDefaultMessages = {
  [type in Partial<MessageTypes>]: {
    default?: (...params: any) => string;
    noResults?: string
  }
};


interface ISendActionToAllUsers {
  action:string, 
  moreDetails:MessageTypes, 
  detailsParams:any[], 
  telegram_id:number, 
  name:string
}

type ActionCallbackName = 'ALL_MONTH_SCHEDULINGS' | 'ONE_MONTH_SCHEDULINGS' | 'ALL_SCHEDULINGS_REQUESTS'
interface IGenerateActions {
  action: ActionCallbackName,
  numberOfResults: number,
  month: string,
  year: string,
  goToPage: number,
  weekday: number[]
}

interface MenuResponse {
  [date: string]: {
    message: string;
    handleReplyMarkup: any;
    events?: []
    parameters: {
      [parameter: string]: MenuResponseParameters
    }
  };
}

type Middlewares = {
  [updateType in UpdateType]?: {
    [updateSubType in MessageSubTypes | Required<'default'>]?:
    (ctx: TelegrafContext, next: () => Promise<void>) => void;
  };
};

interface IActionMessage{
  name:string,
  detailsString:string,
}

@Injectable()
export class TelegramService implements OnModuleInit {
  constructor(
    @InjectRepository(TelegramUserRepository)
    private telegramUserRepository: TelegramUserRepository,

    @InjectRepository(TelegramClientRepository)
    private telegramClientRepository: TelegramClientRepository,

    @InjectRepository(TelegramUserMessageRepository)
    private telegramUserMessageRepository: TelegramUserMessageRepository,

    private telegramUserService: TelegramUserService,
    
    @Inject(forwardRef(()=>FretesService))
    private fretesService: FretesService,
    
    private clientsService: ClientsService,
    
    private pricesService: PricesService,
    
    private configService: ConfigService,
  ) { }

  async getAllTelegrams(): Promise<any> {
    const clients = await this.telegramClientRepository.find();
    const users = await this.telegramUserRepository.find({});
    users.forEach(telegramUser => {
      if (telegramUser?.user) {
        delete telegramUser.user.password
        delete telegramUser.user.salt
        delete telegramUser.user.confirmationToken
        delete telegramUser.user.recoverToken
      }
      return telegramUser
    })
    return [...users, ...clients]
  }
  generate_actions({
    action,
    numberOfResults,
    month,
    year,
    goToPage,
    weekday
  }: Partial<IGenerateActions>) {
    const data = [
      action,
      numberOfResults,
      goToPage,
      month,
      year,
      weekday
    ]
    return JSON.stringify({ data })
    // return jwt

  }

  private token = this.configService.get<string>('TELEGRAM_TOKEN');
  public bot = new Telegraf("1806857753:AAGrSlh_1m3jtQ2VZ3KO1QCa6aGlED_BgtA");
  sendMessage(chatId: string | number, message: string): void {
    this.bot.telegram.sendMessage(chatId, message)
  }
  async sendActionToAllUsers({action, moreDetails, detailsParams, telegram_id, name}: ISendActionToAllUsers) {
    const telegram_users = await this.telegramUserRepository.find()
    console.log(telegram_users);
    const chats_ids = (await Promise.all(
      telegram_users.map(async user => {
        return {
          name: user.first_name,
          telegram_id: user.telegram_id,
          last_message: await this.telegramUserMessageRepository.findOne({
            where: {
              telegramUser: user,
            },
            order: { createdAt: 'DESC' },
            select: ['chat_id', 'telegramUser']
          })
        }
      })
    ))
    // .filter((chat)=> !!chat.last_message?.chat_id)
    
    chats_ids.forEach(obj => {
      // if (obj.telegram_id != ctx.message.from.id) {
      if (obj.telegram_id != telegram_id) {
        this.bot.telegram.sendMessage(obj?.last_message?.chat_id, `${name} ${action}\n\n${this.defaultMessages[moreDetails].default(...detailsParams)}`)
      }
    })
  }
  message = ""

  options = {
    'InitialOptions': () => convertCodesOfEmojisInEmojis(startOptions),
    ...generateOptions()
  }

  defaultMessages:IDefaultMessages = {
    client: {
      noResults: "Nenhum Resultado encontrado!",
      default: (client: Client, contacts: Contact[]) => {
        const message = []
        message.push(`🔎  Informações do Cliente  🔎\n\n`)
        message.push(`🎣  Nome:${client?.name}  🎣\n\n`)
        message.push(`📑  Contatos  📑\n${contacts?.map(
          contact =>
            `✏️  ${contact?.description} - ${contact?.info}  ✏️\n`
        )}\n`)
        return message.join('')
      }

    },
    freteLink:{
      default: (id) => `ℹ️  Dados do Agendamento  ℹ️\n${makeLinks('sched', id)}\n\n`
    },
    frete: {
      noResults: "Nenhum Resultado encontrado!",
      default: (data:Frete) => {
        const message = []
        const stateColor = {
          "Pedido de Agendamento": "🟠",
          "Marcada": "🔵",
          "Cancelada": "🔴",
          "Confirmada": "🟢",
          "Adiada": "⚪",
        }
        message.push(`${stateColor[data?.state]}  Status: ${data?.state}  ${stateColor[data?.state]}\n`)
        message.push(data?.boatman ? `⛴️  Barqueiro: ${data?.boatman?.name}  ⛴️\n` : "")
        message.push(data?.client ? `🎣  Cliente: ${data?.client?.name}  🎣\n` : "")
        message.push(`ℹ️  Dados do Agendamento  ℹ️\n${makeLinks('sched', data.id)}`)
        return message.join('')
      }
    },
    freteData: {
      noResults: '',
      default: (frete: Frete) => {
        const stateColor = {
          "Pedido de Agendamento": "🟠",
          "Marcada": "🔵",
          "Cancelada": "🔴",
          "Confirmada": "🟢",
          "Adiada": "⚪",
        }
        // 👥💵🪙💹💳💰👇👆📑📝✏️
        const message = []
        message.push(`📆  DADOS DO AGENDAMENTO  📆\n\n`)
        message.push(`📆 ${dateMonthDayYearWrited(frete.date.toISOString())}  📆\n`)
        message.push('\n==========\n\n')
        message.push(`🎣  Cliente:${frete?.client?.name}  🎣\n\n`)
        message.push(`⛴️  Barqueiro:${frete?.boatman?.name}  ⛴️\n\n`)
        message.push(`${stateColor[frete?.state]}  Status  ${stateColor[frete?.state]}: ${frete.state}\n`)
        message.push('\n==========\n\n')
        message.push(`👥  Numero de Pessoas Combinado: ${frete.numberOfPeople}  👥\n`)
        message.push('\n==========\n\n')
        message.push(`💵  Deposito: R$${frete.depositPaid}  💵\n`)
        message.push('\n==========\n\n')
        message.push('💰  Tabela de Preços  💰\n')
        message.push('\n==========\n')
        message.push(`${frete.customPrice || frete?.prices?.map(
          price => {
            const priceMessage = []
            priceMessage.push(`\n🪙  ${price.description}: R$${price.value}  🪙\n`)
            return priceMessage.join('')
          }).join('------------------')}
          `)
        message.push('\n==========\n')
        message.push(`\n🔎👇  Consultar dados do Cliente  👇🔎`)
        message.push(`\n/clien${frete.clientId.split('-').join('')}`)


        type TActionToDoInMessage = {
          [type in Partial<IState>]?: (msg: string[]) => void
        }
        const modifyMessagePerActionType:TActionToDoInMessage = {
          'Confirmada': (msg)=> {
            msg.push(`\n\nClique para cancelar o agendamento:\n`)
            msg.push(`\n❌${makeLinks('cancelsch',frete.id)}\n`)
          },
          'Marcada': (msg)=> {
            msg.push(`\n\nClique para confirmar o agendamento:\n`)
            msg.push(`\n✅${makeLinks('confirmsch',frete.id)}`)
            msg.push(`\n\nClique para cancelar o agendamento:\n`)
            msg.push(`\n❌${makeLinks('cancelsch',frete.id)}\n`)
          },
          'Pedido de Agendamento': (msg)=> {
            msg.push(`\n\nJá marcou na agenda?`)
            msg.push(`\nClique para concluir o Pedido de Agendamento:\n`)
            msg.push(`\n${makeLinks('booksch',frete.id)}\n`)
          },
        }
        modifyMessagePerActionType[frete.state] != undefined && modifyMessagePerActionType[frete.state](message)
        return message.join('')
      }
    },
    copyPasteAvailableDates: {
      default: (dates, dayName: string) => {
        const message = `
      **🟢 Datas Disponiveis para *${dayName.toUpperCase()}* em *${new Intl.DateTimeFormat('pt-br', { month: 'long', year: 'numeric' }).format(new Date(dates[0])).toUpperCase()}*:**\n\n${dates.map(
          date => (`\t\t\t*🎣📆  ${new Intl.DateTimeFormat('pt-br', { month: '2-digit', day: '2-digit' }).format(new Date(date))
            }  📆🎣*`))
            .join('\n')
          }\n\n_Dados do mês de ${new Intl.DateTimeFormat(
            'pt-br',
            {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              weekday: 'long',
            }).format(new Date())}_`
        return message
      },
      noResults: "Nenhum barco livre."
    },
    daySchedulingsResume: {
      default: (fretes: GetBusyDatesResponse, dateEn: string) => {
        const stateColor = {
          "Pedido de Agendamento": "🟠",
          "Marcada": "🔵",
          "Cancelada": "🔴",
          "Confirmada": "🟢",
          "Adiada": "⚪",
        }
        const message = [
          `📆  ${new Intl.DateTimeFormat("pt-br", { day: '2-digit', month: 'long', year: "numeric", weekday: 'long' }).format(new Date(dateEn)).toLocaleUpperCase()}  📆`,
          `\n\n📝  Resumo  📝\n\n`,
          `🔵  Marcada: ${fretes.counters?.Marcada}  🔵`,
          `🔴  Cancelada: ${fretes.counters?.Cancelada}  🔴`,
          `🟠  Pedido de Agendamento: ${fretes.counters?.['Pedido de Agendamento']}  🟠`,
          `🟢  Confirmada: ${fretes.counters?.Confirmada}  🟢`,
          `⚪  Adiadas: ${fretes.counters?.Adiada}  ⚪\n\n`,
          Object.keys(fretes.dates).length ? "📆  Agendamentos  📆\n" : ''
        ]
        Object.keys(fretes.dates)?.map((key: string, index) => {
          return `
          ${fretes.dates[key].map(
            scheduling => {
              message.push(`*🎣  ${index + 1}. Cliente: ${scheduling.client.name}  🎣*`)
              message.push(`${stateColor[scheduling.state]}  Status  ${stateColor[scheduling.state]}: ${scheduling.state}`)
              message.push(`🔎  Dados do Cliente  🔎\n${makeLinks('clien', scheduling.client.id)}\n`)
              message.push(`ℹ️  Dados do Agendamento  ℹ️\n${makeLinks('sched', scheduling.id)}\n\n\n`)
            }
          )}
           `
        })
        message.length < 7 && message.push("Nenhum frete agendado!")
        return message.join('\n')
      },
      noResults: "Nenhum Resultado encontrado!",
    },
    connectTelegram: {
      noResults: "Voce não tem permissão de acesso!",
      default: ()=>'Associar Telegram',
    },
    calendarView: {
      noResults: "Sem resultados!",
      default: (dates: DateBusy[]) => {
        function getMessage(boatman: Boatman, client: Client, id: string, state, dateOfScheduling: Date) {
          let message = ""

          const stateColor = {
            "Pedido de Agendamento": "🟠",
            "Marcada": "🔵",
            "Cancelada": "🔴",
            "Confirmada": "🟢",
            "Adiada": "⚪",
          }
          message += '\n======================================'
          message += '\n'
          message += `📆  ${new Intl.DateTimeFormat('pt-br', { day: '2-digit', weekday: 'long', year: 'numeric', month: 'long' }).format(new Date(dateOfScheduling)).toUpperCase()}  📆\n`
          message += `\n`
          message += `🎣  Cliente: ${client?.name}  🎣\n`
          message += `⛴️  Barqueiro: ${boatman?.name}  ⛴️\n`
          message += `${stateColor[state]}  Estado  ${stateColor[state]}: ${state}\n`
          message += `\n`
          message += `🔎  Detalhes do Cliente  🔎\n`
          message += `${makeLinks('clien', client?.id)}\n`
          message += `\n`
          message += `ℹ️  Detalhes do agendamento  ℹ️\n`
          message += `${makeLinks('sched', id)}`
          return message
        }
        const message = dates.map((frete: DateBusy) => {
          const { boatman, client, date, id, state } = frete
          return getMessage(
            boatman,
            client,
            id,
            state,
            date
          )
        })
        return message.join('')
      },
    },
    dateOfRequest: {
      default: ()=> `\n========================================\n📌  Dados consultados em ${new Intl.DateTimeFormat('pt-br', { day: '2-digit', year: 'numeric', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date())}  📌\n========================================`
    },
    schedulingRequest:{
      default: (frete: Frete)=> `Pedidos de Agendamento\n${this.defaultMessages.frete}\n Já marcou na agenda?\n Clique para concluir o Pedido de Agendamento: /booksch${frete.id}\n\n`,
      noResults: ""
    }
  }

  middlewares: Middlewares = {

    callback_query: {
      default: async (ctx, next) => {
        console.log("MID CBQ");
        return next()
      }
    },
    message: {
      contact: async (ctx, next) => {
        const { id } = ctx.from
        const { message_id } = ctx.message
        const messageIdExists = await this.telegramUserMessageRepository.findOne({ where: { message_id } })
        const user = await this.telegramUserRepository.findOne({ telegram_id: id })
        if (!user) {
          return ctx.reply(this.defaultMessages.connectTelegram.noResults)
        }

        const { first_name, user_id, phone_number, last_name } = ctx.message.contact
        const vCard = parseVCard(JSON.parse(JSON.stringify(ctx.message.contact)).vcard)
        const contacts: Pick<IContact, "desc" | "info">[] = vCard.tel.map((contact) => ({ desc: contact.meta.TYPE, info: contact.value[0] }))
        if (!messageIdExists) {
          await this.telegramUserMessageRepository.create({
            updateSubType: ctx.updateSubTypes[0], text: JSON.stringify({ first_name, user_id, phone_number, last_name, contacts }), telegramUser: user, message_id,
          }).save()
        }
        return next()
      },
      text: async (ctx, next) => {
        const { id } = ctx.from
        const { text, message_id } = ctx.message
        const { id: chat_id } = ctx.message.chat
        const messageIdExists = await this.telegramUserMessageRepository.findOne({ where: { message_id } })
        const connectNewTelegramRequest = () => {
          if (ctx.message?.text?.includes(this.defaultMessages.connectTelegram.default())) {

            return next()
          }
        }
        connectNewTelegramRequest()

        const user = await this.telegramUserRepository.findOne({ telegram_id: id })
        if (!user) {
          return ctx.reply(this.defaultMessages.connectTelegram.noResults)
        }
        if (!messageIdExists) {
          await this.telegramUserMessageRepository.create({
            chat_id,
            text,
            telegramUser: user,
            message_id, updateSubType: ctx.updateSubTypes[0]
          }).save()
        }

        return next()
      }
    },
  }

  onModuleInit() {
    this.bot.use(async (ctx, next) => {
      const useMiddlewaresForUpdateTypesAndSubTypes = () => {
        const activeUpdateTypes = Object.keys(this.middlewares).filter(midd => this.middlewares[midd])
        const activeMiddlewares = {}
        activeUpdateTypes.forEach((midd) => {
          Object.assign(
            activeMiddlewares,
            {
              [midd]: Object.keys(this.middlewares[midd])
            }
          )
        })
        if (activeUpdateTypes.includes(ctx.updateType)) {
          if (!ctx.updateSubTypes.length) {
            this.middlewares[ctx.updateType].default(ctx, next)
          }
          if (Object.keys(this.middlewares[ctx.updateType]).includes(ctx.updateSubTypes[0])) {
            this.middlewares[ctx.updateType][ctx.updateSubTypes[0]](ctx, next)
          }
        }
      }
      try {
        useMiddlewaresForUpdateTypesAndSubTypes()
      } catch (error) {
        console.log(error);
      }
    })
    this.bot.on('callback_query', async (ctx) => {
      try {
        const responseText = ctx.callbackQuery.data

        const data = JSON.parse(responseText)?.data

        const action: ActionCallbackName = data[0]
        const numberOfResults = data[1]
        const goToPage = data[2]

        if (action === 'ONE_MONTH_SCHEDULINGS') {
          const month = data[3]
          const year = data[4]
          const weekday = data[5]?.map(day => daysHifen[day])

          const response = await this.fretesService.getBusyDates({ month: month, year: year, numberOfResults, pageSelected: goToPage, busy: true, weekday })
          const lastPage = Math.ceil(response.paginate.count / numberOfResults)
          const menu: InlineKeyboardButton[][] = [[]]
          Number(response.paginate.prevPage) >= 2
            && menu[0].push(
              {
                text: `<< 1`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  weekday: data[5],
                  month, year,
                  action: 'ONE_MONTH_SCHEDULINGS',
                  goToPage: 1
                })
              })
          response.paginate.prevPage
            && menu[0].push(
              {
                text: `<  ${String(response.paginate.prevPage)}`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  month, year,
                  action: 'ONE_MONTH_SCHEDULINGS',
                  weekday: data[5],
                  goToPage: response.paginate.prevPage
                })
              })

          response.paginate.nextPage
            && menu[0].push(
              {
                text: `${String(response.paginate.nextPage)}  >`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  month, year,
                  action: 'ONE_MONTH_SCHEDULINGS',
                  weekday: data[5],
                  goToPage: response.paginate.nextPage
                })
              })
          response.paginate.nextPage
            && lastPage > response.paginate.nextPage && menu[0].push(
              {
                text: `${String(lastPage)}  >>`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  weekday: data[5],

                  month, year,
                  action: 'ONE_MONTH_SCHEDULINGS',
                  goToPage: Math.ceil(response.paginate.count / numberOfResults)
                })
              })
          const message = Object.keys(response.dates).map(date => {
            const fretes: DateBusy[] = response.dates[date] as any
            return this.defaultMessages.calendarView.default(fretes)
          })
          message.push(this.defaultMessages.dateOfRequest.default())
          message.push('\n')
          return ctx.editMessageText(message.join('\n'), {
            reply_markup: {
              inline_keyboard: menu
            },
          });
        }
        if (action === 'ALL_MONTH_SCHEDULINGS') {
          const month = data[3]
          const year = data[4]
          const response = await this.fretesService.getBusyDates({ month: month, year: year, numberOfResults, pageSelected: goToPage, busy: true })
          const lastPage = Math.ceil(response.paginate.count / numberOfResults)
          const menu: InlineKeyboardButton[][] = [[]]

          Number(response.paginate.prevPage) >= 2
            && menu[0].push(
              {
                text: `<< 1`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  month, year,
                  action: 'ALL_MONTH_SCHEDULINGS',
                  goToPage: 1
                })
              })
          response.paginate.prevPage
            && menu[0].push(
              {
                text: `<  ${String(response.paginate.prevPage)}`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  month, year,
                  action: 'ALL_MONTH_SCHEDULINGS',
                  goToPage: response.paginate.prevPage
                })
              })

          response.paginate.nextPage
            && menu[0].push(
              {
                text: `${String(response.paginate.nextPage)}  >`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  month, year,
                  action: 'ALL_MONTH_SCHEDULINGS',
                  goToPage: response.paginate.nextPage
                })
              })
          response.paginate.nextPage
            && lastPage > response.paginate.nextPage && menu[0].push(
              {
                text: `${String(lastPage)}  >>`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  month, year,
                  action: 'ALL_MONTH_SCHEDULINGS',
                  goToPage: Math.ceil(response.paginate.count / numberOfResults)
                })
              })
          const message = Object.keys(response.dates).map(date => {
            const fretes: DateBusy[] = response.dates[date] as any
            return this.defaultMessages.calendarView.default(fretes)
          })
          message.push(this.defaultMessages.dateOfRequest.default())
          message.push('\n')
          return ctx.editMessageText(message.join('\n'), {
            reply_markup: {
              inline_keyboard: menu
            },
          });
        }
        if (action === 'ALL_SCHEDULINGS_REQUESTS') {

          const {fretes, paginate} = await this.fretesService.getSchedulingRequests({numberOfResults, pageSelected:goToPage});
          const lastPage = Math.ceil(paginate.count / numberOfResults)
          const menu: InlineKeyboardButton[][] = [[]]
          
          Number(paginate.prevPage) >= 2
            && menu[0].push(
              {
                text: `<< 1`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  action,
                  goToPage: 1
                })
              })
          paginate.prevPage
            && menu[0].push(
              {
                text: `<  ${String(paginate.prevPage)}`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  action,
                  goToPage: paginate.prevPage
                })
              })

          paginate.nextPage
            && menu[0].push(
              {
                text: `${String(paginate.nextPage)}  >`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  action,
                  goToPage: paginate.nextPage
                })
              })
          paginate.nextPage
            && lastPage > paginate.nextPage && menu[0].push(
              {
                text: `${String(lastPage)}  >>`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  action,
                  goToPage: Math.ceil(paginate.count / numberOfResults)
                })
              })
          const message = fretes.map(frete => this.defaultMessages.frete.default(frete))

          message.push(this.defaultMessages.dateOfRequest.default())
          message.push('\n')
          return ctx.editMessageText(message.join('\n'), {
            reply_markup: {
              inline_keyboard: menu
            },
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
    this.bot.on('contact', async (ctx) => {
      const { first_name, user_id, phone_number, last_name } = ctx.message.contact
      const vCard = parseVCard(JSON.parse(JSON.stringify(ctx.message.contact)).vcard)
      const contacts: Pick<IContact, "desc" | "info">[] = vCard.tel.map((contact) => ({ desc: contact.meta.TYPE, info: contact.value[0] }))

      const client = await this.clientsService.findByContact({ contacts })
      const actionOptions: InlineKeyboardButton[] = [
        { text: 'Agendar data' }
      ]
      if (!client) {
        actionOptions.push({ text: 'Salvar contato' })
        return ctx.reply("Oque deseja realizar com esse contato?", {
          reply_markup: {
            keyboard: [
              [{ "text": "Salvar contato e agendar pescaria" }],
              [{ "text": "Salvar contato" }],
            ]
          }
        })
      }
      const contactsOfClient = await this.clientsService.getContactsByClientId(client.id)

      ctx.reply(`Contato encontrado: ${this.defaultMessages.client.default(client, contactsOfClient)}`)
      return ctx.reply("Oque deseja realizar com esse contato?", {
        reply_markup: {
          keyboard: [
            [{ "text": "Iniciar agendamento" }],
            [{ "text": `Visualizar Dados do Cliente: ${client.id}` }],
          ]
        }
      })
    })
    this.bot.on('text', async (ctx) => {
      const getFretes = (month: string, year: string) => this.fretesService.getBusyDates({ busy: true, month, year })
        .then(result => result)
      const getMonthAfterOrLaterCurrentMonth = (numberOfMonths, later = true) => {
        // if(later){
        //   return new Intl.DateTimeFormat('en-us', {month:'2-digit', day:'2-digit', year:'numeric'}).format(add(new Date(), {
        //     months: numberOfMonths
        //   }))
        // }else{
        //   return new Intl.DateTimeFormat('en-us', {month:'2-digit', day:'2-digit', year:'numeric'}).format(sub(new Date(), {
        //     months: numberOfMonths
        //   }))

        // }
        const currentMonth = Number(new Intl.DateTimeFormat('pt-br', { month: '2-digit' }).format(new Date()))
        const currentDay = 10
        const currentYear = Number(new Intl.DateTimeFormat('pt-br', { year: 'numeric' }).format(new Date()))
        let month = Number(later ? currentMonth - numberOfMonths : currentMonth + numberOfMonths)
        let year = currentYear
        if (later) {
          if(month == 0){
            month = 12
            year--
          }
          else if(month < 0){
            month += 12
            year--
            if(month == 0){
              month = 12
              year++
            }
          }
          else if(month > 12){
            month = 12 - numberOfMonths
            year++
            if(month == 0){
              month = 12
              year--
            }
          }
        }else{
          if(month > 12){
            month -= 12  
            year++
          }
        }
        return `${month}/${currentDay}/${year}`
    }


      const menu: MenuResponse = {
        'Consulta': {
          message: 'Escolha uma das opções abaixo: ',
          handleReplyMarkup: (parameters) => ({
            keyboard: Object.keys(parameters).map(key => ([{ text: key }]))
          }),
          parameters: (() => {
            const obj: MenuResponseParameters = {} as MenuResponseParameters
            const makeMessage = (res) => Object.keys(res?.dates)
              .map(date => {
                return `\t\t\t${new Intl.DateTimeFormat('pt-br', {
                  day: '2-digit', weekday: 'long', month: 'long', year: 'numeric'
                }).format(new Date(date)).toUpperCase()}:\n${res?.dates?.[date]?.map(this.defaultMessages.frete.default).join('')}`
              }
              ).join('\n\t\t==========================================\n\n\n') || this.defaultMessages.frete.noResults

            for (let index = 7; index > 0; index--) {
              const laterDate = getMonthAfterOrLaterCurrentMonth(index)
              const afterDate = getMonthAfterOrLaterCurrentMonth(index, false)
              obj[`${dateMonthYearWrited(laterDate)}`] = ({
                handleMessage: () => {
                  return Promise.resolve(
                    getFretes(`${laterDate.split('/')[0]}`, `${laterDate.split('/')[2]}`)
                  ).then(res => makeMessage(res))
                },
                handleReplyMarkup: () => {
                  return {
                    keyboard: []
                  }
                }
              })
              obj[`${dateMonthYearWrited(afterDate)}`] = ({
                handleMessage: () => {
                  return Promise.resolve(
                    getFretes(`${afterDate.split('/')[0]}`, `${afterDate.split('/')[2]}`)
                  ).then(res => makeMessage(res))
                },
                handleReplyMarkup: () => {
                  return {
                    keyboard: []
                  }
                }
              })
            }
            obj[`${dateMonthYearWrited(new Date().toLocaleDateString())}`] = {
              handleMessage: () => {
                return Promise.resolve(
                  getFretes(`${new Date().getMonth() + 1}`, `${new Date().getFullYear()}`
                  ).then(res => makeMessage(res))
                )
              },
              handleReplyMarkup: () => {
                return {
                  keyboard: []
                }
              }
            }
            console.log(Object.keys(obj));
            
            const reordered = (() => {
              const finalObj = {}
              Object.keys(obj)
                .sort((a, b) => {
                  if (Number(a.split('-')[0].split('/')[1]) < Number(b.split('-')[0].split('/')[1])) return -1
                  if (Number(a.split('-')[0].split('/')[1]) > Number(b.split('-')[0].split('/')[1])) return 1
                  return 0
                })
                .sort((a, b) => {
                  if (Number(a.split('-')[0].split('/')[1]) === Number(b.split('-')[0].split('/')[1])) {
                    if (Number(a.split('-')[0].split('/')[0]) < Number(b.split('-')[0].split('/')[0])) return -1
                    if (Number(a.split('-')[0].split('/')[0]) > Number(b.split('-')[0].split('/')[0])) return 1
                  }
                  return 0
                }
                ).forEach(item => { finalObj[item] = obj[item] })
              return finalObj
            }
            )()
            return reordered
          })()
        },
        'Datas Livres': {
          message: 'Escolha uma das opções abaixo: ',
          handleReplyMarkup: (parameters) => ({
            keyboard: Object.keys(parameters).map(key => ([{ text: key }]))
          }),
          parameters: (() => {
            const obj: MenuResponseParameters = {} as MenuResponseParameters
            const makeMessage = (res) => Object.keys(res?.dates)
              .map(date => {
                return `${date}:\n${res?.dates?.[date]?.map(this.defaultMessages.frete.default).join('')}`
              }
              ).join('') || this.defaultMessages.frete.noResults

            for (let index = 7; index > 0; index--) {
              const afterDate = getMonthAfterOrLaterCurrentMonth(index, false)
              obj[`${dateMonthYearWrited(afterDate)}`] = ({
                handleMessage: () => {
                  return Promise.resolve(
                    getFretes(`${afterDate.split('/')[0]}`, `${afterDate.split('/')[2]}`)
                  ).then(res => makeMessage(res))
                },
                handleReplyMarkup: () => {
                  return {
                    keyboard: []
                  }
                }
              })
            }
            obj[dateMonthYearWrited(new Date().toLocaleDateString())] = {
              handleMessage: () => {
                return Promise.resolve(
                  getFretes(`${new Date().getMonth() + 1}`, `${new Date().getFullYear()}`
                  ).then(res => makeMessage(res))
                )
              },
              handleReplyMarkup: () => {
                return {
                  keyboard: []
                }
              }
            }
            const reordered = (() => {
              const finalObj = {}
              Object.keys(obj)
                .sort((a, b) => {
                  if (Number(a.split('-')[0].split('/')[1]) < Number(b.split('-')[0].split('/')[1])) return -1
                  if (Number(a.split('-')[0].split('/')[1]) > Number(b.split('-')[0].split('/')[1])) return 1
                  return 0
                })
                .sort((a, b) => {
                  if (Number(a.split('-')[0].split('/')[1]) === Number(b.split('-')[0].split('/')[1])) {
                    if (Number(a.split('-')[0].split('/')[0]) < Number(b.split('-')[0].split('/')[0])) return -1
                    if (Number(a.split('-')[0].split('/')[0]) > Number(b.split('-')[0].split('/')[0])) return 1
                  }
                  return 0
                }
                ).forEach(item => { finalObj[item] = obj[item] })
              return finalObj
            }
            )()
            return reordered
          })()
        },

      }
      if (ctx.message.text === 'Page') {
        const bookPages = 100;
        this.bot.telegram.sendMessage(ctx.chat.id, 'Page: 25', getPagination(25, bookPages))
      } else {
        if (Object.keys(menu.Consulta.parameters).includes(ctx.message.text)) {
          const { message, parameters, handleReplyMarkup } = menu.Consulta
          Promise
            .resolve(parameters[ctx.message.text].handleMessage())
            .then(responseMessage => {
              ctx.reply(responseMessage, { reply_markup: parameters[ctx.message.text].handleReplyMarkup() })
            })
        }
        else if (ctx.message.text === 'Consulta') {
          console.log(menu['Consulta'].parameters);
          
          const keyboard = [
            ...Object.keys(menu['Consulta'].parameters)
              .map(key => ([{ text: `Agendamentos - ${key}` }])),
          ]
          return ctx.reply('Selecione a opção desejada:', {
            reply_markup: {
              keyboard
            }
          })
        }
        else if (Object.keys(menu['Consulta'].parameters).map(dataString => `Agendamentos - ${dataString}`.toUpperCase()).includes(ctx.message.text.toUpperCase().trim())) {
          const { month, monthName, year } = (() => {
            const [date, monthName] = ctx.message.text.replace("Agendamentos - ", "").split(" ")
            const [month, year] = date.split('/').map(data => Number(data))
            return { month, year, monthName }
          })()


          ctx.reply('Qual dia?', {
            reply_markup: {
              keyboard: [[{ text: "Consulta" }], [{ text: `Ver todos os agendamentos: ${month}/${year}` }], ...daysHifen.map(day => [{ text: `Agendamentos: ${day} | ${month}/${year}` }])]
            }
          })
        }
        else if (ctx.message.text.includes('Visualizar Dados do Cliente')) {
          const [str, clienID] = ctx.message.text.split(':')
          this.clientsService.getOne({ id: clienID.trim() })
            .then((client) => {
              return ctx.reply(this.defaultMessages.client.default(client, client.contacts), {})
            })
        }
        else if (ctx.message.text.substr(0, 6).includes('clien')) {
          const clienID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(6))
          this.clientsService.getOne({ id: clienID })
            .then((client) => {
              // const message = `Informações do Cliente\n\nNome:${client?.name}\n\nContatos:\n${client.contacts.map(contact => `${contact?.description} - ${contact?.info}\n`)}\n`
              return ctx.reply(this.defaultMessages.client.default(client, client.contacts), {})
            })
        }
        else if (ctx.message.text.substr(0, 11).includes('confirmsch')) {

          const schedID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(11))
          if(!await this.fretesService.changeState(schedID, 'Confirmada')){
            return ctx.reply('Erro ao executar a ação')
          }
          await this.sendActionToAllUsers(
            {
              action: `confirmou um agendamento ✅`,
              moreDetails: 'freteLink',
              detailsParams: [schedID],
              name: ctx.from.first_name,
              telegram_id: ctx.from?.id
            }
          )
          return ctx.reply(`✅ Confirmada com sucesso!\n\n Clique aqui para ver os detalhes do agendamento:\n\n ${makeLinks('sched',schedID)}`)
          
        }
        else if (ctx.message.text.substr(0, 10).includes('cancelsch')) {

          const schedID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(10))
          if(!await this.fretesService.changeState(schedID, 'Cancelada')){
            return ctx.reply('Erro ao executar a ação')
          }
          await this.sendActionToAllUsers(
            {
              action: `cancelou um agendamento ❌`,
              moreDetails: 'freteLink',
              detailsParams: [schedID],
              name: ctx.from.first_name,
              telegram_id: ctx.from?.id
            }
          )
          return ctx.reply(`❌ Cancelado com sucesso!\n\n Clique aqui para ver os detalhes do agendamento:\n\n ${makeLinks('sched',schedID)}`)
          
        }
        else if (ctx.message.text.substr(0, 8).includes('booksch')) {
          console.log();
          
          const schedID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(8))
          if(!await this.fretesService.changeState(schedID, 'Marcada')){
            return ctx.reply('Erro ao executar a ação')
          }
          await this.sendActionToAllUsers(
            {
              action: `concluiu o pedido de agendamento 📝`,
              moreDetails: 'freteLink',
              detailsParams: [schedID],
              name: ctx.from.first_name,
              telegram_id: ctx.from?.id
            }
          )
          return ctx.reply(`📝 Marcada com sucesso!\n\n Clique aqui para ver os detalhes do agendamento:\n\n ${makeLinks('sched',schedID)}`)
          
        }
        else if (ctx.message.text.substr(0, 6).includes('sched')) {
          const schedID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(6))
          this.fretesService.getOne({ id: schedID })
            .then(({ frete }) => {
              let message = this.defaultMessages.freteData.default(frete)
              message += this.defaultMessages.dateOfRequest.default()
              ctx.reply(message, {})
            })
        }
        else if (ctx.message.text === 'Datas Livres') {
          ctx.reply('Selecione a opção desejada:', {
            reply_markup: {
              keyboard: Object.keys(menu['Datas Livres'].parameters).map(key => ([{ text: `Ver Datas Livres - ${key}` }]))
            }
          })
        }

        else if (ctx.message.text.includes("Visualizar data: ")) {
          const dateBr = ctx.message.text.split('-')[1].trim()
          const dateEn = (() => {
            const dateSplited = dateBr.split('/')
            return `${dateSplited[2]}/${dateSplited[1].length === 1 ? `0${dateSplited[1]}` : dateSplited[1]}/${dateSplited[0].length === 1 ? `0${dateSplited[0]}` : dateSplited[0]}`
          }
          )()
          this.fretesService.getBusyDates({ fullDate: dateEn, busy: false })
            .then(fretes => {
              ctx.reply(this.defaultMessages.daySchedulingsResume.default(fretes, dateEn), {
                parse_mode: 'Markdown',
                reply_markup: {
                  one_time_keyboard: true,
                  keyboard: [
                    [{ text: `Pedido de Agendamento - ${dateBr}` }],
                    [{ text: `Ver Datas Livres - ${dateBr.split('/')[1]}/${dateBr.split('/')[2]} - ${new Intl.DateTimeFormat('pt-br', { month: 'long' }).format(new Date(dateEn))}` }],
                    [{ text: `Datas Livres` }],
                  ]
                }
              })

            })
        }
        else if (ctx.message.text.includes("Ver todos os agendamentos:")) {
          const [month, year] = ctx.message.text.split(':')[1].trim().split('/')
          const numberOfResults = 1
          const response = await this.fretesService.getBusyDates({ month: month, year: year, numberOfResults, pageSelected: 1, busy: true })

          const message = Object.keys(response.dates).map(date => {
            const fretes: DateBusy[] = response.dates[date] as any
            return this.defaultMessages.calendarView.default(fretes)
          })

          const menu: InlineKeyboardButton[][] = [[]]
          response.paginate.prevPage
            && menu[0].push(
              {
                text: `<  ${String(response.paginate.prevPage)}`,
                callback_data: this.generate_actions(
                  {
                    action: 'ALL_MONTH_SCHEDULINGS',
                    numberOfResults,
                    month,
                    year,
                    goToPage: response.paginate.prevPage
                  }
                )
              })
          // CONVERTER PARA JWT PQ SÓ ACEITA STRING DE ATÉ 64 BYTES
          response.paginate.nextPage
            && menu[0].push(
              {
                text: `${String(response.paginate.nextPage)}  >`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  month, year,
                  goToPage: response.paginate.nextPage,
                  action: 'ALL_MONTH_SCHEDULINGS'
                })
              }
            )
          // callback_data: JSON.stringify({ "numberOfResults": numberOfResults, "month": month, "year": year, "goToPage": response.paginate.nextPage }) })
          menu[0].push(
            {
              text: `${String(Math.ceil(response.paginate.count / numberOfResults))}  >>`,
              callback_data: this.generate_actions({
                numberOfResults,
                month, year,
                goToPage: Math.ceil(response.paginate.count / numberOfResults),
                action: 'ALL_MONTH_SCHEDULINGS'
              })
            }
          )
          // callback_data: JSON.stringify({ "numberOfResults": numberOfResults, "month": month, "year": year, "goToPage": Math.ceil(response.paginate.count / numberOfResults) }) })
          console.log(menu)
          message.push(this.defaultMessages.dateOfRequest.default())
          message.push('\n')
          ctx.reply(message.join('\n'), {
            reply_markup: {
              inline_keyboard: menu
            }
          })

          return message
        }
        else if (ctx.message.text.includes("Agendamentos: ")) {
          const numberOfResults = 1

          const day = ctx.message.text.split(':')[1].split('|')[0].trim()
          const searchDays = []
          if (day.toUpperCase() === "Dias de semana".toUpperCase()) {
            searchDays.push(...daysHifen.filter((day, index) => ![0, 6, 7, 8].includes(index)))
          }
          else if (day.toUpperCase() === "Finais de semana".toUpperCase()) {
            searchDays.push(daysHifen[6], daysHifen[0])
          } else {
            searchDays.push(day)
          }

          const [month, year] = ctx.message.text.split('|')[1].trim().split('/')
          const monthName = new Intl.DateTimeFormat('pt-br', { month: 'long' }).format(new Date(`${year}/${month}/1`))
          const weekday = searchDays.map(searchDay => {
            return daysHifen.findIndex(day => day === searchDay)
          })

          this.fretesService.getBusyDates({ numberOfResults, busy: true, month: month, year: year, weekday: searchDays })
            .then((response) => {
              const dates = []
              const freteDays: any = []
              console.log(response.paginate)
              Object.keys(response.dates).map((date, index) => {
                if (index < 2) {
                  dates.push(...response.dates[date])
                  freteDays.push(date)
                }
              })
              const menu: InlineKeyboardButton[][] = [[]]
              response.paginate.prevPage
                && menu[0].push(

                  {
                    text: `<  ${String(response.paginate.prevPage)}`,
                    callback_data: this.generate_actions({
                      action: 'ONE_MONTH_SCHEDULINGS',
                      month, year,
                      goToPage: response.paginate.prevPage,
                      numberOfResults,
                      weekday
                    })
                  })
              response.paginate.nextPage
                && menu[0].push({
                  text: `${String(response.paginate.nextPage)}  >`,
                  callback_data: this.generate_actions({
                    action: 'ONE_MONTH_SCHEDULINGS',
                    month, year,
                    goToPage: response.paginate.nextPage,
                    numberOfResults,
                    weekday
                  })
                })
              response.paginate.nextPage
                && menu[0].push({
                  text: `${String(Math.ceil(response.paginate.count / numberOfResults))}  >>`,
                  callback_data: this.generate_actions({
                    action: 'ONE_MONTH_SCHEDULINGS',
                    month, year,
                    goToPage: Math.ceil(response.paginate.count / numberOfResults),
                    numberOfResults,
                    weekday
                  })
                })
              ctx.reply(
                dates.length ? this.defaultMessages.calendarView.default(dates) : this.defaultMessages.calendarView.noResults,
                {
                  reply_markup: {
                    inline_keyboard: menu,
                }
                })
            })
        }
        else if (ctx.message.text.includes("Verificar disponibilidade: ")) {
          const day = ctx.message.text.split(':')[1].split('|')[0].trim()
          const [month, year] = ctx.message.text.split('|')[1].trim().split('/')
          const monthName = new Intl.DateTimeFormat('pt-br', { month: 'long' }).format(new Date(`${month}/1/${year}`))
          this.fretesService.getAvailableDates({ month: Number(month), year: Number(year) })
            .then((response) => {
              const responseData = Object.keys(response).find(key => key.toUpperCase() === day.toUpperCase())
              if (response[responseData].length) {
                return ctx.reply(
                  this.defaultMessages.copyPasteAvailableDates.default(response[responseData], day)
                  , {
                    parse_mode: 'Markdown',
                    reply_markup: {
                      keyboard: [
                        [{ text: `Agendamentos - ${month}/${year} - ${monthName}` }],
                        [{ text: `Ver Datas Livres - ${month}/${year} - ${monthName}` }],
                        ...response[responseData]
                          .map(date => {
                            const dayBrFormat = []
                            dayBrFormat.push(date.split('/')[1])
                            dayBrFormat.push(date.split('/')[0])
                            dayBrFormat.push(date.split('/')[2])
                            return [
                              `Visualizar data: ${new Intl.DateTimeFormat(
                                'pt-br',
                                {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })
                                .format(
                                  new Date(date)
                                )} - ${dayBrFormat.join('/')}`
                            ]
                          })
                      ]
                    }
                  })
              } else {
                return ctx.reply(
                  this.defaultMessages.copyPasteAvailableDates.noResults
                  , {
                    reply_markup: {
                      keyboard: [
                        [{ text: `Agendamentos - ${month}/${year} - ${monthName}` }],
                        [{ text: `Ver Datas Livres - ${month}/${year} - ${monthName}` }],
                      ]
                    }
                  })
              }
            })
        }
        else if (Object.keys(menu['Datas Livres'].parameters).map(dataString => `Ver Datas Livres - ${dataString}`.toUpperCase()).includes(ctx.message.text.toUpperCase().trim())) {
          const { month, monthName, year } = (() => {
            const [date, monthName] = ctx.message.text.replace("Ver Datas Livres - ", "").split(" ")
            const [month, year] = date.split('/').map(data => Number(data))
            return { month, year, monthName }
          })()


          ctx.reply('Qual dia?', {
            reply_markup: {
              keyboard: [[{ text: "Datas Livres" }], ...daysHifen.map(day => [{ text: `Verificar disponibilidade: ${day} | ${month}/${year}` }])]
            }
          })
        }
        else if (ctx.message.text.includes("Me")) {
          ctx.reply(ctx.message.contact?.phone_number || 'akdslam')
        }
        else if (ctx.message.text.includes(this.defaultMessages.connectTelegram.default())) {
          const instanceId = ctx.message.text.split(':')[1].trim()
          const { first_name, id, is_bot, language_code, last_name, username } = ctx.from
          try {
            const instance = await this.telegramUserRepository.findOne(instanceId)
            if (instance && instance.telegram_id) {
              return ctx.reply("Telegram já foi associado à instancia!")
            }
            await this.telegramUserService.connectTelegramToInstance({
              instanceId, data: {
                first_name, telegram_id: id, is_bot, language_code, last_name, username
              }
            })
            return ctx.reply("Telegram associado com sucesso!")
          } catch (error) {
            return ctx.reply("Erro ao Associar o Telegram com a Instancia")
          }
        }
        else if (ctx.message.text.includes("Pedido de Agendamento - ")) {
          return ctx.reply("Envie o contato do cliente salvo no seu celular.")
        }

        else if (ctx.message.text.includes("Agendar dia")) {
          const [boatmanId, dateWithText, boatmanName] = ctx.message.text.split('-')
          const date = dateWithText.split(':')[1].trim()
          const { fretes, count } = await this.fretesService.verifyIfDateIsAvailable(`${date.split('/')[2]}/${date.split('/')[1]}/${date.split('/')[0]}`)
          if (count >= 2) {
            ctx.reply("Não há vaga nessa data")
            return ctx.reply(fretes.map(frete => this.defaultMessages.frete.default(frete)).join('\n'))
          }
          const boatmenAvailable = await this.fretesService.boatmenAvailable({ date: `${date.split('/')[2]}/${date.split('/')[1]}/${date.split('/')[0]}` })

          if (!boatmenAvailable.find(boatman => boatman.id == Number(boatmanId))) {
            return ctx.reply("O barqueiro selecionado não está disponivel nessa data!")
          }
          const prices = await this.pricesService.findAllActiveIds()
          const telegramUser = await this.telegramUserRepository.findOne({where:{telegram_id: ctx.from.id}})
          const messages = await this.telegramUserMessageRepository.find({
            where: { text: Not("Iniciar agendamento"), telegramUser },
            order: { updatedAt: "DESC" },
            take: 10
          })
          const contactsData = messages.find(message => message.updateSubType.includes('contact'))?.text
          
          const { contacts } = JSON.parse(contactsData)
          const client = await this.clientsService.findByContact({ contacts })
          if (!client) {
            return ctx.reply('Erro ao buscar o Cliente')
          }

          const newFrete = await this.fretesService.create({
            prices: prices.map(price => price.id),
            boatmanId,
            clientId: client?.id,
            state: 'Pedido de Agendamento',
            customPrice: null,
            date: new Date(`${date.split('/')[2]}/${date.split('/')[1]}/${date.split('/')[0]}`)
          })
          this.sendActionToAllUsers(
            {
              action:"criou um Pedido de Agendamento",
              moreDetails:'frete',
              detailsParams: [newFrete],
              name:ctx.from.first_name,
              telegram_id: ctx.from.id
            }
            // "criou um Pedido de Agendamento", 
            // this.defaultMessages.frete.default(newFrete), 
            // ctx.from.id, 
            // ctx.from.first_name
          )
          return ctx.reply(this.defaultMessages.frete.default(newFrete))
        }
        else if (ctx.message.text === "Salvar contato") {
          const messages = await this.telegramUserMessageRepository.find({
            where: { text: Not("Salvar contato"), updateSubType: 'contact' },
            order: { updatedAt: "DESC" },
            take: 1
          })
          const savedContactDataMessage = JSON.parse(messages.find(message => message.updateSubType.includes('contact'))?.text)
          const contacts: Pick<IContact, "desc" | "info">[] = savedContactDataMessage.contacts.map((contact) => ({ desc: contact.desc, info: contact.info }))
          const clientExists = await this.clientsService.findByContact({ contacts })
          if (clientExists) {
            const contactsOfClient = await this.clientsService.getContactsByClientId(clientExists.id)
            return ctx.reply(`Cliente já existe na base de dados:\n${this.defaultMessages.client.default(clientExists as Client, contactsOfClient)}`)
          }
          const client = await this.clientsService.create({
            contacts,
            name: savedContactDataMessage.first_name,
          }) as Client
          const contactsOfClient = await this.clientsService.getContactsByClientId(client.id)
          this.sendActionToAllUsers(
            {
              action:"adicionou um novo contato a base de dados",
              moreDetails: 'client',
              detailsParams: [client as Client, contactsOfClient],
              telegram_id:ctx.from.id,
              name:ctx.from.first_name
            }
          )
          return ctx.reply(`Cliente salvo com sucesso:\n${this.defaultMessages.client.default(client as Client, contactsOfClient)}`)
        }
        else if (ctx.message.text.includes("Iniciar agendamento")) {
          const telegramUser = await this.telegramUserRepository.findOne({where:{telegram_id: ctx.from.id}})
          const messages = await this.telegramUserMessageRepository.find({
            where: { text: Not("Iniciar agendamento"), telegramUser },
            order: { updatedAt: "DESC" },
            take: 5
          })
          const date = messages.find(message => message.text.includes('Pedido de Agendamento'))?.text?.split('-')[1].trim()
          const boatmen = await this.fretesService.boatmenAvailable({ date: `${date.split('/')[2]}/${date.split('/')[1]}/${date.split('/')[0]}` })
          return ctx.reply("Escolha o barqueiro", {
            reply_markup: {
              one_time_keyboard: true,
              keyboard: boatmen.map(key => ([{ text: `${key.id} - Agendar dia: ${date} - ${key.name}` }])) as any
            }
          })
        }
        else if (ctx.message.text == "Visualizar Pedidos de Agendamento") {
          const numberOfResults = 1
          const {fretes, paginate} = await this.fretesService.getSchedulingRequests({numberOfResults, pageSelected:1});
          console.log(fretes );
          
          if(!fretes.length){
            return ctx.reply("Não há Pedidos de Agendamento")
          }
          const message = fretes.map(frete => this.defaultMessages.frete.default(frete))
          const menu: InlineKeyboardButton[][] = [[]]
          paginate.prevPage
            && menu[0].push(
              {
                text: `<  ${String(paginate.prevPage)}`,
                callback_data: this.generate_actions(
                  {
                    action: 'ALL_SCHEDULINGS_REQUESTS',
                    numberOfResults,
                    goToPage: paginate.prevPage
                  }
                )
              })
          // CONVERTER PARA JWT PQ SÓ ACEITA STRING DE ATÉ 64 BYTES
          paginate.nextPage
            && menu[0].push(
              {
                text: `${String(paginate.nextPage)}  >`,
                callback_data: this.generate_actions({
                  numberOfResults,
                  goToPage: paginate.nextPage,
                  action: 'ALL_SCHEDULINGS_REQUESTS'
                })
              }
            )
          menu[0].push(
            {
              text: `${String(Math.ceil(paginate.count / numberOfResults))}  >>`,
              callback_data: this.generate_actions({
                numberOfResults,
                goToPage: Math.ceil(paginate.count / numberOfResults),
                action: 'ALL_SCHEDULINGS_REQUESTS'
              })
            }
          )
          console.log(menu)
          message.push(this.defaultMessages.dateOfRequest.default())
          message.push('\n')
          ctx.reply(message.join('\n'), {
            reply_markup: {
              inline_keyboard: menu
            }
          })

          return message
          // return ctx.reply(
          //   `Pedidos de Agendamento:
          //   ${fretes.map((frete)=>this.defaultMessages.freteData.default(frete)).join('\n\n')}`)
        }
        else if (ctx.message.text == "Salvar contato e agendar pescaria") {
          const messages = await this.telegramUserMessageRepository.find({
            where: { text: Not("Salvar contato"), updateSubType: 'contact' },
            order: { updatedAt: "DESC" },
            take: 1
          })
          const savedContactDataMessage = JSON.parse(messages.find(message => message.updateSubType.includes('contact'))?.text)
          const contacts: Pick<IContact, "desc" | "info">[] = savedContactDataMessage.contacts.map((contact) => ({ desc: contact.desc, info: contact.info }))
          const clientExists = await this.clientsService.findByContact({ contacts })
          if (clientExists) {
            const contactsOfClient = await this.clientsService.getContactsByClientId(clientExists.id)
            return ctx.reply(`Cliente já existe na base de dados:\n${this.defaultMessages.client.default(clientExists as Client, contactsOfClient)}`,{
              reply_markup: {
                keyboard: [
                  [{ "text": "Iniciar agendamento" }],
                  [{ "text": `Visualizar Dados do Cliente: ${clientExists.id}` }],
                ]
              }
            })
          }
          const client = await this.clientsService.create({
            contacts,
            name: savedContactDataMessage.first_name,
          }) as Client
          const contactsOfClient = await this.clientsService.getContactsByClientId(client.id)
          this.sendActionToAllUsers(
            {
              action: "adicionou um novo contato a base de dados",
              moreDetails:'client',
              detailsParams:[client as Client, contactsOfClient],
              telegram_id:ctx.from.id,
              name: ctx.from.first_name 
            }
            // "adicionou um novo contato a base de dados",
            //  this.defaultMessages.client.default(client as Client, contactsOfClient), 
            //  ctx.from.id, 
            //  ctx.from.first_name
            )

          ctx.reply(`Cliente salvo com sucesso:\n${this.defaultMessages.client.default(client as Client, contactsOfClient)}`)
          return ctx.reply("Oque deseja realizar com esse contato?", {
            reply_markup: {
              keyboard: [
                [{ "text": "Iniciar agendamento" }],
                [{ "text": `Visualizar Dados do Cliente: ${client.id}` }],
              ]
            }
          })

        }
        else if (Object.keys(menu).includes(ctx.message.text)) {
          const { message, parameters, handleReplyMarkup } = menu[ctx.message.text]
          ctx.reply(message, {
            reply_markup: handleReplyMarkup(parameters)
          })

        } else {
          console.log(ctx.message.text);

          ctx.reply('Comando desconhecido, favor tentar novamente', {
            reply_markup: {
              keyboard: [
                [{ text: "Consulta" }],
                [{ text: "Datas Livres" }],
                [{ text: "Visualizar Pedidos de Agendamento" }],
              ]
            }
          })

        }
      }
    })
    try {
      this.bot.launch()
    } catch (error) {
      console.log(error);

    }
  }
}