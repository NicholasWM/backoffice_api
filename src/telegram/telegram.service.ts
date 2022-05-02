import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from "@nestjs/config"
import { FretesService } from 'src/fretes/fretes.service';
import { Telegraf } from 'telegraf'
import { defaultMessages, getMonthAfterOrLaterCurrentMonth, makeLinks, generate_confirm_actions, generate_paginate_actions } from './helpers'
import { formatString } from '../utils/regex'
import { dateMonthYearWrited } from '../utils/dateHelper'
import { ClientsService } from 'src/clients/clients.service';
import { IContact } from 'src/clients/types';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramUserRepository } from 'src/telegram-user/telegram-user.repository';
import { TelegramClientRepository } from 'src/telegram-client/telegram-client.repository';
import { TelegramUserService } from 'src/telegram-user/telegram-user.service';
import { TelegramUserMessageRepository } from 'src/telegram-user-messages/telegram-user.repository';
import { ExtraReplyMessage, InlineKeyboardButton } from 'telegraf/typings/telegram-types';
import { Not } from 'typeorm';
import { PricesService } from 'src/prices/prices.service';
import { Client } from 'src/clients/clients.entity';
import { parseVCard } from './helpers';
import { DateBusy } from 'src/fretes/interfaces';
import { TelegrafContext } from 'telegraf/typings/context';
import { CreateFreteDTO } from 'src/fretes/dtos';
import { CBQueryTelegramExecuteActionToFunction, CBQueryTelegramListActionToFunction, ExecuteActionCallbackName, IAllMonthSchedulingsCallbackQueryAction, IAllSchedulingsRequestsCallbackQueryAction, IOneMonthSchedulingsCallbackQueryAction, ISendActionToAllUsers, KeywordsActionResponse, MATCH_TYPES_ORDER, MenuResponse, MenuResponseParameters, Middlewares, TDaysHifen, TMatchTypesOrder } from './types';
import { IState } from 'src/fretes/types';

const daysHifen: TDaysHifen[] = [
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

    @Inject(forwardRef(() => FretesService))
    private fretesService: FretesService,

    private clientsService: ClientsService,

    private pricesService: PricesService,

    private configService: ConfigService,
  ) { }

  private readonly logger = new Logger("Telegram Service");
  // private token = this.configService.get<string>('TELEGRAM_TOKEN');
  public bot = new Telegraf("5371078295:AAFgSYCYXkdsaz73OalQoM9sens3Kae_5z0");

  message = ""

  // options = {
  //   'InitialOptions': () => convertCodesOfEmojisInEmojis(startOptions),
  //   ...generateOptions()
  // }

  middlewares: Middlewares = {
    callback_query: {
      default: async (ctx, next) => {
        // const responseText = ctx.callbackQuery.data
        // const data: TOneMonthSchedulingsCallbackRequestText = JSON.parse(responseText)?.data
        // this.logger.debug(data)
        return next()
      }
    },
    message: {
      contact: (ctx: TelegrafContext, next) => this.persistMessageData(ctx, next),
      text: (ctx: TelegrafContext, next) => this.verifyUserPermission(ctx, next)
      // text: (ctx: TelegrafContext, next) => next()
    },
  }
  listsActionToFunction: CBQueryTelegramListActionToFunction = {
    ONE_DAY_OF_MONTH_SCHEDULINGS: (data, ctx) => {
      const [action, numberOfResults, goToPage, month, year, weekdayIndex] = data
      this.oneMonthSchedulingsCallbackQueryAction({
        ctx,
        month,
        year,
        numberOfResults,
        goToPage,
        weekdays: weekdayIndex?.map(day => daysHifen[day]),
        weekdayIndex
      })
    },
    ALL_DAYS_OF_MONTH_SCHEDULINGS: (data, ctx) => {
      const [action, numberOfResults, goToPage, month, year] = data
      this.allDaysOfMonthSchedulingsCallbackQueryAction({
        ctx,
        month,
        year,
        numberOfResults,
        goToPage,
      })
    },
    ALL_SCHEDULINGS_REQUESTS: (data, ctx) => {
      const [action, numberOfResults, goToPage] = data
      this.allSchedulingsRequests({
        ctx,
        action,
        numberOfResults,
        goToPage,
      })
    },

  }

  executeActionToFunction: CBQueryTelegramExecuteActionToFunction = {
    RETURN_TO: async (data, ctx) => {
      const menu: InlineKeyboardButton[][] = [[]]
      return ctx.editMessageText('Ação cancelada', {
        reply_markup: {
          inline_keyboard: menu
        },
      });
    },
    CANCEL_SCHED: async (data, ctx) => {
      const [action, schedID] = data
      if (!await this.fretesService.changeState(schedID, 'Cancelada')) {
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
      const menu: InlineKeyboardButton[][] = [[]]
      menu[0].push(this.menuActionButtons.oneSchedulingDetails({ action: 'ONE_SCHED_DETAILS', id: schedID }))
      const message = `❌ Cancelado com sucesso!\n\n Clique aqui para ver os detalhes do agendamento:\n\n ${makeLinks('sched', schedID)}`
      return ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: menu
        },
      });
    },
    CONFIRM_SCHED: async (data, ctx) => {
      const [action, schedID] = data

      if (!await this.fretesService.changeState(schedID, 'Confirmada')) {
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
      const message = `✅ Confirmada com sucesso!\n\n Clique aqui para ver os detalhes do agendamento:\n\n ${makeLinks('sched', schedID)}`
      const menu: InlineKeyboardButton[][] = [[]]
      menu[0].push(this.menuActionButtons.oneSchedulingDetails({ action: 'ONE_SCHED_DETAILS', id: schedID }))
      return ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: menu
        },
      });
    },
    BOOK_SCHED: async (data, ctx) => {
      const [action, schedID] = data
      if (!await this.bookScheduling(schedID, ctx)) {
        return;
      }
      const menu: InlineKeyboardButton[][] = [[]]
      menu[0].push(this.menuActionButtons.oneSchedulingDetails({ action: 'ONE_SCHED_DETAILS', id: schedID }))
      const message = `📝 Marcada com sucesso!\n\n Clique aqui para ver os detalhes do agendamento:\n\n ${makeLinks('sched', schedID)}`
      return ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: menu
        },
      });

    },
    ONE_SCHED_DETAILS: async (data, ctx) => {
      const [action, schedID] = data
      const { message, extra } = await this.getOneSchedulingDetails(schedID, ctx)
      return ctx.editMessageText(message, extra);
    },
    ASK_BOOK_SCHED: async (data, ctx) => {
      const [action, schedID] = data
      await this.menuActionButtons.askActionBookScheduling(schedID, ctx)
    },
    ASK_CANCEL_SCHED: async (data, ctx) => {
      const [action, schedID] = data
      await this.menuActionButtons.askActionCancelScheduling(schedID, ctx)
    },
    ASK_CONFIRM_SCHED: async (data, ctx) => {
      const [action, schedID] = data
      await this.menuActionButtons.askActionConfirmScheduling(schedID, ctx)
    },
    CLIENT_DETAILS: async (data, ctx) => {
      const [action, clienID] = data
      await this.getClientDetails(clienID, ctx)
    },
    PRICES_SCHED: async (data, ctx) => {
      const [action, clienID] = data
      // await this.getClientDetails(clienID, ctx)
    }
  }

  keywordsToAction: KeywordsActionResponse = {
    // "asd": {verifyMatch: (ctx, keyword) => ctx.message.text.includes(keyword), execute: ()=>{}},
    'Visualizar Dados do Cliente': {
      matchType: "SIMPLE_INCLUDE",
      verifyMatch: (ctx, keyword) => {
        return ctx.message.text.includes(keyword)
      },
      execute: async (ctx) => {
        const [str, clienID] = ctx.message.text?.split(':')
        this.clientsService.getOne({ id: clienID.trim() })
          .then((client) => {
            ctx.reply(defaultMessages.client.default(client, client.contacts), {})
          })
      }
    },
    "Visualizar data: ": {
      matchType: "SIMPLE_INCLUDE",
      verifyMatch: (ctx, keyword) => {
        return ctx.message.text.includes(keyword)
      },
      execute: async (ctx) => {
        const dateBr = ctx.message.text.split('-')[1].trim()
        const dateEn = (() => {
          const dateSplited = dateBr.split('/')
          return `${dateSplited[2]}/${dateSplited[1].length === 1 ? `0${dateSplited[1]}` : dateSplited[1]}/${dateSplited[0].length === 1 ? `0${dateSplited[0]}` : dateSplited[0]}`
        }
        )()
        this.fretesService.getBusyDates({ fullDate: dateEn, busy: false })
          .then(fretes => {
            ctx.reply(defaultMessages.daySchedulingsResume.default(fretes, dateEn), {
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
      },
    },
    "Ver todos os agendamentos:": {
      matchType: "SIMPLE_INCLUDE",
      verifyMatch: (ctx, keyword) => {
        return ctx.message.text.includes(keyword)
      },
      execute: async (ctx) => {
        const [month, year] = ctx.message.text.split(':')[1].trim().split('/')
        const numberOfResults = 1
        const response = await this.fretesService.getBusyDates({ month: month, year: year, numberOfResults, pageSelected: 1, busy: true })

        const message = Object.keys(response.dates).map(date => {
          const fretes: DateBusy[] = response.dates[date] as any
          return defaultMessages.calendarView.default(fretes)
        })
        const schedID = Object.keys(response.dates).map(key => response.dates[key][0].id)[0]
        const clienID = Object.keys(response.dates).map(key => response.dates[key][0].client.id)[0]
        const menu: InlineKeyboardButton[][] = [[], [], []]
        menu[0].push({
          text: 'Ver Detalhes do Cliente',
          callback_data: generate_confirm_actions({
            action: 'CLIENT_DETAILS',
            targetId: clienID
          })
        })
        menu[1].push(
          this.menuActionButtons.oneSchedulingDetails({ action: 'ONE_SCHED_DETAILS', id: schedID, customText: 'Ver Detalhes do Frete' })
        )
        response.paginate.prevPage
          && menu[2].push(
            {
              text: `<  ${String(response.paginate.prevPage)}`,
              callback_data: generate_paginate_actions(
                {
                  action: 'ALL_DAYS_OF_MONTH_SCHEDULINGS',
                  numberOfResults,
                  month,
                  year,
                  goToPage: response.paginate.prevPage
                }
              )
            })
        // CONVERTER PARA JWT PQ SÓ ACEITA STRING DE ATÉ 64 BYTES
        response.paginate.nextPage
          && menu[2].push(
            {
              text: `${String(response.paginate.nextPage)}  >`,
              callback_data: generate_paginate_actions({
                numberOfResults,
                month, year,
                goToPage: response.paginate.nextPage,
                action: 'ALL_DAYS_OF_MONTH_SCHEDULINGS'
              })
            }
          )
        menu[2].push(
          {
            text: `${String(Math.ceil(response.paginate.count / numberOfResults))}  >>`,
            callback_data: generate_paginate_actions({
              numberOfResults,
              month, year,
              goToPage: Math.ceil(response.paginate.count / numberOfResults),
              action: 'ALL_DAYS_OF_MONTH_SCHEDULINGS'
            })
          }
        )
        message.push(defaultMessages.dateOfRequest.default())
        message.push('\n')
        ctx.reply(message.join('\n'), {
          reply_markup: {
            inline_keyboard: menu
          }
        })

        return message
      },
    },
    "Agendamentos: ": {
      matchType: "SIMPLE_INCLUDE",
      verifyMatch: (ctx, keyword) => {
        return ctx.message.text.includes(keyword)
      },
      execute: async (ctx) => {
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

        this.fretesService.getBusyDates({ numberOfResults, busy: true, month: month, year: year, weekdays: searchDays })
          .then((response) => {
            const dates = []
            const freteDays: any = []
            Object.keys(response.dates).map((date, index) => {
              if (index < 2) {
                dates.push(...response.dates[date])
                freteDays.push(date)
              }
            })
            const menu: InlineKeyboardButton[][] = [[], [], []]
            const schedID = Object.keys(response.dates).map(key => response.dates[key][0].id)[0]
            const clienID = Object.keys(response.dates).map(key => response.dates[key][0].client.id)[0]
            menu[0].push({
              text: 'Ver Detalhes do Cliente',
              callback_data: generate_confirm_actions({
                action: 'CLIENT_DETAILS',
                targetId: clienID
              })
            })
            menu[1].push(
              this.menuActionButtons.oneSchedulingDetails({ action: 'ONE_SCHED_DETAILS', id: schedID, customText: 'Ver Detalhes do Frete' })
            )
            response.paginate.prevPage
              && menu[2].push(

                {
                  text: `<  ${String(response.paginate.prevPage)}`,
                  callback_data: generate_paginate_actions({
                    action: 'ONE_DAY_OF_MONTH_SCHEDULINGS',
                    month, year,
                    goToPage: response.paginate.prevPage,
                    numberOfResults,
                    weekday
                  })
                })
            response.paginate.nextPage
              && menu[2].push({
                text: `${String(response.paginate.nextPage)}  >`,
                callback_data: generate_paginate_actions({
                  action: 'ONE_DAY_OF_MONTH_SCHEDULINGS',
                  month, year,
                  goToPage: response.paginate.nextPage,
                  numberOfResults,
                  weekday
                })
              })
            response.paginate.nextPage
              && menu[2].push({
                text: `${String(Math.ceil(response.paginate.count / numberOfResults))}  >>`,
                callback_data: generate_paginate_actions({
                  action: 'ONE_DAY_OF_MONTH_SCHEDULINGS',
                  month, year,
                  goToPage: Math.ceil(response.paginate.count / numberOfResults),
                  numberOfResults,
                  weekday
                })
              })
            ctx.reply(
              dates.length ? defaultMessages.calendarView.default(dates) : defaultMessages.calendarView.noResults,
              {
                reply_markup: {
                  inline_keyboard: menu,
                }
              })
          })
      },
    },
    "Verificar disponibilidade: ": {
      matchType: "SIMPLE_INCLUDE",
      verifyMatch: (ctx, keyword) => {
        return ctx.message.text.includes(keyword)
      },
      execute: async (ctx) => {
        const day = ctx.message.text.split(':')[1].split('|')[0].trim()
        const [month, year] = ctx.message.text.split('|')[1].trim().split('/')
        const monthName = new Intl.DateTimeFormat('pt-br', { month: 'long' }).format(new Date(`${month}/1/${year}`))
        this.fretesService.getAvailableDates({ month: Number(month), year: Number(year) })
          .then((response) => {
            const responseData = Object.keys(response).find(key => key.toUpperCase() === day.toUpperCase())
            if (response[responseData].length) {
              return ctx.reply(
                defaultMessages.copyPasteAvailableDates.default(response[responseData], day)
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
                defaultMessages.copyPasteAvailableDates.noResults
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
      },
    },
    "Pedido de Agendamento - ": {
      matchType: "SIMPLE_INCLUDE",
      verifyMatch: (ctx, keyword) => {
        return ctx.message.text.includes(keyword)
      },
      execute: async (ctx) => {
        return ctx.reply("Envie o contato do cliente salvo no seu celular.")
      },
    },
    "Agendar dia": {
      matchType: "SIMPLE_INCLUDE",
      verifyMatch: (ctx, keyword) => {
        return ctx.message.text.includes(keyword)
      },
      execute: async (ctx) => {
        const [boatmanId, dateWithText, boatmanName] = ctx.message.text.split('-')
        const date = dateWithText.split(':')[1].trim()
        const { fretes, count } = await this.fretesService.verifyIfDateIsAvailable(`${date.split('/')[2]}/${date.split('/')[1]}/${date.split('/')[0]}`)
        if (count >= 2) {
          ctx.reply("Não há vaga nessa data")
          return ctx.reply(fretes.map(frete => defaultMessages.frete.default(frete)).join('\n'))
        }
        const boatmenAvailable = await this.fretesService.boatmenAvailable({ date: `${date.split('/')[2]}/${date.split('/')[1]}/${date.split('/')[0]}` })
        const isBoatmanUndefined = String(boatmanId).trim() == '0'

        if (!boatmenAvailable.length && isBoatmanUndefined) {
          return ctx.reply("Não tem barqueiros disponiveis nessa data!")
        }
        if (!isBoatmanUndefined) {
          if (!boatmenAvailable.find(boatman => boatman.id == Number(boatmanId))) {
            return ctx.reply("O barqueiro selecionado não está disponivel nessa data!")
          }
        }
        const prices = await this.pricesService.findAllActiveIds()
        const telegramUser = await this.telegramUserRepository.findOne({ where: { telegram_id: ctx.from.id } })
        const messages = await this.telegramUserMessageRepository.find({
          where: { text: Not("Iniciar agendamento"), telegramUser },
          order: { updatedAt: "DESC" },
          take: 10
        })
        const contactsData = messages?.find(message => message.updateSubType.includes('contact'))?.text

        const { contacts } = JSON.parse(contactsData)
        const client = await this.clientsService.findByContact({ contacts })
        if (!client) {
          return ctx.reply('Erro ao buscar o Cliente')
        }
        const frete: CreateFreteDTO = {
          prices: prices.map(price => price.id),
          clientId: client?.id,
          state: 'Pedido de Agendamento',
          customPrice: null,
          date: new Date(`${date.split('/')[2]}/${date.split('/')[1]}/${date.split('/')[0]}`)
        }

        if (!isBoatmanUndefined) {
          frete["boatmanId"] = boatmanId
        }
        const newFrete = await this.fretesService.create(frete)
        this.sendActionToAllUsers(
          {
            action: "criou um Pedido de Agendamento",
            moreDetails: 'frete',
            detailsParams: [newFrete],
            name: ctx.from.first_name,
            telegram_id: ctx.from.id
          }
        )
        const menu: InlineKeyboardButton[][] = [[]]
        menu[0].push(this.menuActionButtons.oneSchedulingDetails({ action: 'ONE_SCHED_DETAILS', id: newFrete?.id }))

        return ctx.reply(defaultMessages.frete.default(newFrete), {
          reply_markup: {
            inline_keyboard: menu
          },
        })
      },
    },
    "Iniciar agendamento": {
      matchType: "SIMPLE_INCLUDE",
      verifyMatch: (ctx, keyword) => {
        return ctx.message.text.includes(keyword)
      },
      execute: async (ctx) => {
        const telegramUser = await this.telegramUserRepository.findOne({ where: { telegram_id: ctx.from.id } })
        const messages = await this.telegramUserMessageRepository.find({
          where: { text: Not("Iniciar agendamento"), telegramUser },
          order: { updatedAt: "DESC" },
          take: 10
        })
        const date = messages.find(message => message.text.includes('Pedido de Agendamento'))?.text?.split('-')[1].trim()
        const boatmen = await this.fretesService.boatmenAvailable({ date: `${date.split('/')[2]}/${date.split('/')[1]}/${date.split('/')[0]}` })
        return ctx.reply("Escolha o barqueiro", {
          reply_markup: {
            one_time_keyboard: true,
            keyboard: [[{ text: `0 - Agendar dia: ${date} - Indefinido` }], ...boatmen.map(key => ([{ text: `${key.id} - Agendar dia: ${date} - ${key.name}` }]))] as any
          }
        })
      },
    },
    "Salvar contato": {
      matchType: "SIMPLE_INCLUDE",
      verifyMatch: (ctx, keyword) => {
        return ctx.message.text.includes(keyword)
      },
      execute: async (ctx) => {
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
          return ctx.reply(`Cliente já existe na base de dados:\n${defaultMessages.client.default(clientExists as Client, contactsOfClient)}`)
        }
        const client = await this.clientsService.create({
          contacts,
          name: savedContactDataMessage.first_name,
        }) as Client
        const contactsOfClient = await this.clientsService.getContactsByClientId(client.id)
        this.sendActionToAllUsers(
          {
            action: "adicionou um novo contato a base de dados",
            moreDetails: 'client',
            detailsParams: [client as Client, contactsOfClient],
            telegram_id: ctx.from.id,
            name: ctx.from.first_name
          }
        )
        return ctx.reply(`Cliente salvo com sucesso:\n${defaultMessages.client.default(client as Client, contactsOfClient)}`)
      },
    },
    [defaultMessages.connectTelegram.default()]: {
      matchType: "SIMPLE_INCLUDE",
      verifyMatch: (ctx, keyword) => {
        return ctx.message.text.includes(keyword)
      },
      execute: async (ctx) => {
        const instanceId = ctx.message.text.split(':')[1].trim()
        const { first_name, id, is_bot, language_code, last_name, username } = ctx.from
        try {
          const instance = await this.telegramUserRepository.findOne(instanceId)
          if (!instance) {
            return ctx.reply('Id da instancia não existe no banco!')
          }
          if (instance && instance.telegram_id) {
            return ctx.reply("Telegram já foi associado à instancia!")
          }
          if (!id) {
            return ctx.reply("Id nulo!")
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
    },
    "Salvar contato e agendar pescaria": {
      matchType: 'EXACT',
      verifyMatch: (ctx, keyword) => ctx.message.text === keyword,
      execute: async (ctx) => {
        const messages = await this.telegramUserMessageRepository.find({
          where: { text: Not("Salvar contato"), updateSubType: 'contact' },
          order: { updatedAt: "DESC" },
          take: 1
        })

        const savedContactDataMessage: { first_name: string, last_name: string, phone_number: string, contacts: { desc: string, info: string }[] } = JSON.parse(messages.find(message => message.updateSubType.includes('contact'))?.text)
        const contacts: Pick<IContact, "desc" | "info">[] = savedContactDataMessage.contacts.map((contact) => ({ desc: contact.desc, info: contact.info }))
        const clientExists = await this.clientsService.findByContact({ contacts })


        if (clientExists) {
          const contactsOfClient = await this.clientsService.getContactsByClientId(clientExists.id)
          return ctx.reply(`Cliente já existe na base de dados:\n${defaultMessages.client.default(clientExists as Client, contactsOfClient)}`, {
            reply_markup: {
              keyboard: [
                [{ "text": "Iniciar agendamento" }],
                [{ "text": `Visualizar Dados do Cliente: ${clientExists.id}` }],
              ]
            }
          })
        }
        const name = [
          savedContactDataMessage?.first_name,
          savedContactDataMessage?.last_name,
        ].filter(item => !!item).join(' ')
        const client = await this.clientsService.create({
          contacts,
          name,
        }) as Client

        if (client) {
          const contactsOfClient = await this.clientsService.getContactsByClientId(client.id)

          this.sendActionToAllUsers(
            {
              action: "adicionou um novo contato a base de dados",
              moreDetails: 'client',
              detailsParams: [client as Client, contactsOfClient],
              telegram_id: ctx.from.id,
              name: ctx.from.first_name
            }
          )

          ctx.reply(`Cliente salvo com sucesso:\n${defaultMessages.client.default(client as Client, contactsOfClient)}`)
          return ctx.reply("Oque deseja realizar com esse contato?", {
            reply_markup: {
              keyboard: [
                [{ "text": "Iniciar agendamento" }],
                [{ "text": `Visualizar Dados do Cliente: ${client.id}` }],
              ]
            }
          })
        }
      }
    },
    'clien': {
      matchType: 'SIMPLE_INCLUDE',
      verifyMatch: (ctx, keyword) => ctx.message.text.substr(0, 6).includes(keyword),
      execute: async (ctx) => {
        const clienID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(6))
        await this.getClientDetails(clienID, ctx)
      }
    },
    'confirmsch': {
      matchType: 'SIMPLE_INCLUDE',
      verifyMatch: (ctx, keyword) => ctx.message.text.substr(0, 11).includes(keyword),
      execute: async (ctx) => {
        const schedID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(11))
        await this.menuActionButtons.askActionConfirmScheduling(schedID, ctx)

        // //Done

      }
    },
    'cancelsch': {
      matchType: 'SIMPLE_INCLUDE',
      verifyMatch: (ctx, keyword) => ctx.message.text.substr(0, 10).includes(keyword),
      execute: async (ctx) => {
        const schedID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(10))
        await this.menuActionButtons.askActionCancelScheduling(schedID, ctx)
        // //Done
      }
    },
    'booksch': {
      matchType: 'SIMPLE_INCLUDE',
      verifyMatch: (ctx, keyword) => ctx.message.text.substr(0, 8).includes(keyword),
      execute: async (ctx) => {
        const schedID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(8))
        await this.menuActionButtons.askActionBookScheduling(schedID, ctx)
      }
    },
    'sched': {
      matchType: 'SIMPLE_INCLUDE',
      verifyMatch: (ctx, keyword) => ctx.message.text.substr(0, 6).includes(keyword),
      execute: async (ctx) => {
        const schedID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(6))
        const { message, extra } = await this.getOneSchedulingDetails(schedID, ctx)
        return ctx.editMessageText(message, extra)
      }
    },
    "Visualizar Pedidos de Agendamento": {
      matchType: 'EXACT',
      verifyMatch: (ctx, keyword) => ctx.message.text === keyword,
      execute: (ctx) => this.getAllSchedulingRequestsHomeButtons(ctx)
    },
    '/VerPedidosDeAgendamento': {
      matchType: 'SIMPLE_INCLUDE',
      verifyMatch: (ctx, keyword) => ctx.message.text.includes(keyword),
      execute: (ctx) => this.getAllSchedulingRequestsHomeButtons(ctx)
    }
  }
  @Cron(CronExpression.EVERY_2_HOURS)
  notifySchedulingsRequests() {
    this.logger.debug('Notify Schedullings Request to all users');
    this.fretesService.getSchedulingRequests({ numberOfResults: 1, pageSelected: 1 })
      .then(({ fretes, paginate }) => {
        if (!!paginate?.lastPage) {
          return this.sendActionToAllUsers(
            {
              action: `enviou um lembrete`,
              moreDetails: 'schedulingRequest',
              detailsParams: [],
              name: "Logger",
              telegram_id: 0
            }
          )
        }
      })
  }

  onModuleInit() {
    this.bot.use(this.useMiddlewaresForUpdateTypesAndSubTypes.bind(this))
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this))
    this.bot.on('contact', this.handleContact.bind(this))
    this.bot.on('text', this.handleText.bind(this))
    try {
      this.bot.launch()
    } catch (error) {
      console.log(error);

    }
  }

  async handleContact(ctx: TelegrafContext) {
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

    ctx.reply(`Contato encontrado: ${defaultMessages.client.default(client, contactsOfClient)}`)
    return ctx.reply("Oque deseja realizar com esse contato?", {
      reply_markup: {
        keyboard: [
          [{ "text": "Iniciar agendamento" }],
          [{ "text": `Visualizar Dados do Cliente: ${client.id}` }],
        ]
      }
    })
  }
  async handleCallbackQuery(ctx: TelegrafContext) {
    try {
      const responseText = ctx.callbackQuery.data
      const data = JSON.parse(responseText)
      const [action] = data
      if (action) {
        if (Object.keys(this.listsActionToFunction).includes(action)) {
          this.listsActionToFunction[action](data, ctx)
        }
        if (Object.keys(this.executeActionToFunction).includes(action)) {
          this.executeActionToFunction[action](data, ctx)
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  async handleText(ctx: TelegrafContext) {

    let functionCallOrder: TMatchTypesOrder = {}
    let condition = Object.keys(this.keywordsToAction).filter(keyword => {
      if (this.keywordsToAction[keyword].verifyMatch(ctx, keyword)) {
        if (!functionCallOrder[this.keywordsToAction[keyword].matchType]) {
          functionCallOrder[this.keywordsToAction[keyword].matchType] = []
        }
        functionCallOrder[this.keywordsToAction[keyword].matchType].push((ctx) => this.keywordsToAction[keyword].execute(ctx))
        return true
      }
    })
    if (condition?.length) {
      let isExecuteCommand = false
      Object.keys(MATCH_TYPES_ORDER).forEach(matchIndex => {
        functionCallOrder[MATCH_TYPES_ORDER[matchIndex]]?.forEach((cb: Function): void => {
          if (!isExecuteCommand) {
            isExecuteCommand = true
            cb(ctx)
            return
          }
        })
        if (isExecuteCommand) { return; }
      })
      return
    }

    if (Object.keys(this.menu.Consulta.parameters).includes(ctx.message.text)) {
      const { message, parameters, handleReplyMarkup } = this.menu.Consulta
      Promise
        .resolve(parameters[ctx.message.text].handleMessage())
        .then(responseMessage => {
          ctx.reply(responseMessage, { reply_markup: parameters[ctx.message.text].handleReplyMarkup() })
        })
    }
    else if (Object.keys(this.menu['Consulta'].parameters).map(dataString => `Agendamentos - ${dataString}`.toUpperCase()).includes(ctx.message.text.toUpperCase().trim())) {
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
    else if (Object.keys(this.menu['Datas Livres'].parameters).map(dataString => `Ver Datas Livres - ${dataString}`.toUpperCase()).includes(ctx.message.text.toUpperCase().trim())) {
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
    else if (Object.keys(this.menu).includes(ctx.message.text)) {
      const { message, parameters, handleReplyMarkup } = this.menu[ctx.message.text]
      ctx.reply(message, {
        reply_markup: handleReplyMarkup(parameters)
      })

    }
    else {
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
  useMiddlewaresForUpdateTypesAndSubTypes(ctx: TelegrafContext, next: () => Promise<void>) {
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
  async persistMessageData(ctx, next) {
    try {
      const { id } = ctx.from
      const { message_id } = ctx.message
      const messageIdExists = await this.telegramUserMessageRepository.findOne({ where: { message_id } })
      const user = await this.telegramUserRepository.findOne({ telegram_id: id })
      if (!user) {
        return ctx.reply(defaultMessages.connectTelegram.noResults)
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
    } catch (error) {
      console.log(error)
    }
  }
  async verifyUserPermission(ctx: TelegrafContext, next) {
    const { id } = ctx.from
    const { text, message_id } = ctx.message
    const { id: chat_id } = ctx.message.chat
    const messageIdExists = await this.telegramUserMessageRepository.findOne({ where: { message_id } })
    const connectNewTelegramRequest = () =>
      ctx.message?.text?.includes(defaultMessages.connectTelegram.default())

    const user = await this.telegramUserRepository.findOne({ telegram_id: id })
    if (!user) {
      if (connectNewTelegramRequest()) {
        return next()
      }
      return ctx.reply(defaultMessages.connectTelegram.noResults)
    }
    if (!messageIdExists) {
      await this.telegramUserMessageRepository.create({
        chat_id,
        text,
        telegramUser: user,
        message_id,
        updateSubType: ctx.updateSubTypes[0]
      }).save()
    }

    return next()
  }
  async oneMonthSchedulingsCallbackQueryAction({
    ctx,
    month,
    year,
    weekdays,
    numberOfResults,
    goToPage,
    weekdayIndex
  }: IOneMonthSchedulingsCallbackQueryAction) {
    // Search data
    const response = await this.fretesService.getBusyDates({
      month: month,
      year: year,
      numberOfResults,
      pageSelected: goToPage,
      busy: true,
      weekdays: weekdays
    })
    // Create navigation buttons of menu
    const menu: InlineKeyboardButton[][] = [[], [], []]
    const schedID = Object.keys(response.dates).map(key => response.dates[key][0].id)[0]
    const clienID = Object.keys(response.dates).map(key => response.dates[key][0].client.id)[0]
    menu[0].push({
      text: 'Ver Detalhes do Cliente',
      callback_data: generate_confirm_actions({
        action: 'CLIENT_DETAILS',
        targetId: clienID
      })
    })
    menu[1].push(
      this.menuActionButtons.oneSchedulingDetails({ action: 'ONE_SCHED_DETAILS', id: schedID, customText: 'Ver Detalhes do Frete' })
    )
    const lastPage = Math.ceil(response.paginate.count / numberOfResults)
    Number(response.paginate.prevPage) >= 2
      && menu[2].push(
        {
          text: `<< 1`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            weekday: weekdayIndex,
            month, year,
            action: 'ONE_DAY_OF_MONTH_SCHEDULINGS',
            goToPage: 1
          })
        })
    response.paginate.prevPage
      && menu[2].push(
        {
          text: `<  ${String(response.paginate.prevPage)}`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            month, year,
            action: 'ONE_DAY_OF_MONTH_SCHEDULINGS',
            weekday: weekdayIndex,
            goToPage: response.paginate.prevPage
          })
        })

    response.paginate.nextPage
      && menu[2].push(
        {
          text: `${String(response.paginate.nextPage)}  >`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            month, year,
            action: 'ONE_DAY_OF_MONTH_SCHEDULINGS',
            weekday: weekdayIndex,
            goToPage: response.paginate.nextPage
          })
        })
    response.paginate.nextPage
      && lastPage > response.paginate.nextPage && menu[2].push(
        {
          text: `${String(lastPage)}  >>`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            weekday: weekdayIndex,

            month, year,
            action: 'ONE_DAY_OF_MONTH_SCHEDULINGS',
            goToPage: Math.ceil(response.paginate.count / numberOfResults)
          })
        })
    // Done

    // Create message Text
    const message = Object.keys(response.dates).map(date => {
      const fretes: DateBusy[] = response.dates[date] as any
      return defaultMessages.calendarView.default(fretes)
    })
    message.push(defaultMessages.dateOfRequest.default())
    message.push('\n')
    //Done

    // Send message with menu
    return ctx.editMessageText(message.join('\n'), {
      reply_markup: {
        inline_keyboard: menu
      },
    });
  }
  async allDaysOfMonthSchedulingsCallbackQueryAction({
    ctx,
    month,
    year,
    numberOfResults,
    goToPage,
  }: IAllMonthSchedulingsCallbackQueryAction) {

    // Search data
    const response = await this.fretesService.getBusyDates({
      month: month,
      year: year,
      numberOfResults,
      pageSelected: goToPage,
      busy: true
    })

    const schedID = Object.keys(response.dates).map(key => response.dates[key][0].id)[0]
    const clienID = Object.keys(response.dates).map(key => response.dates[key][0].client.id)[0]
    // Create navigation buttons of menu
    const menu: InlineKeyboardButton[][] = [[], [], []]
    menu[0].push({
      text: 'Ver Detalhes do Cliente',
      callback_data: generate_confirm_actions({
        action: 'CLIENT_DETAILS',
        targetId: clienID
      })
    })
    menu[1].push(
      this.menuActionButtons.oneSchedulingDetails({ action: 'ONE_SCHED_DETAILS', id: schedID, customText: 'Ver Detalhes do Frete' })
    )
    const lastPage = Math.ceil(response.paginate.count / numberOfResults)
    Number(response.paginate.prevPage) >= 2
      && menu[2].push(
        {
          text: `<< 1`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            month, year,
            action: 'ALL_DAYS_OF_MONTH_SCHEDULINGS',
            goToPage: 1
          })
        })
    response.paginate.prevPage
      && menu[2].push(
        {
          text: `<  ${String(response.paginate.prevPage)}`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            month, year,
            action: 'ALL_DAYS_OF_MONTH_SCHEDULINGS',
            goToPage: response.paginate.prevPage
          })
        })

    response.paginate.nextPage
      && menu[2].push(
        {
          text: `${String(response.paginate.nextPage)}  >`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            month, year,
            action: 'ALL_DAYS_OF_MONTH_SCHEDULINGS',
            goToPage: response.paginate.nextPage
          })
        })
    response.paginate.nextPage
      && lastPage > response.paginate.nextPage && menu[2].push(
        {
          text: `${String(lastPage)}  >>`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            month, year,
            action: 'ALL_DAYS_OF_MONTH_SCHEDULINGS',
            goToPage: Math.ceil(response.paginate.count / numberOfResults)
          })
        })
    // Done

    // Create message Text
    const message = Object.keys(response.dates).map(date => {
      const fretes: DateBusy[] = response.dates[date] as any
      return defaultMessages.calendarView.default(fretes)
    })
    message.push(defaultMessages.dateOfRequest.default())
    message.push('\n')
    //Done

    // Send message with menu
    return ctx.editMessageText(message.join('\n'), {
      reply_markup: {
        inline_keyboard: menu
      },
    });
  }
  async allSchedulingsRequests({
    ctx,
    action,
    numberOfResults,
    goToPage,
  }: IAllSchedulingsRequestsCallbackQueryAction) {
    // Search data
    const { fretes, paginate } = await this.fretesService.getSchedulingRequests({
      numberOfResults,
      pageSelected: goToPage
    });

    // Create navigation buttons of menu
    const lastPage = Math.ceil(paginate.count / numberOfResults)
    const schedID = fretes[0].id
    const clienID = fretes[0].clientId
    const menu: InlineKeyboardButton[][] = [[], [], [], []]
    menu[0].push({
      text: 'Concluir Pedido de Agendamento',
      callback_data: generate_confirm_actions({
        action: 'ASK_BOOK_SCHED',
        targetId: schedID
      })
    })
    menu[1].push({
      text: 'Ver Detalhes do Cliente',
      callback_data: generate_confirm_actions({
        action: 'CLIENT_DETAILS',
        targetId: clienID
      })
    })
    menu[2].push(
      this.menuActionButtons.oneSchedulingDetails({ action: 'ONE_SCHED_DETAILS', id: schedID, customText: 'Ver Detalhes do Frete' })
    )


    Number(paginate.prevPage) >= 2
      && menu[3].push(
        {
          text: `<< 1`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            action,
            goToPage: 1
          })
        })
    paginate.prevPage
      && menu[3].push(
        {
          text: `<  ${String(paginate.prevPage)}`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            action,
            goToPage: paginate.prevPage
          })
        })

    paginate.nextPage
      && menu[3].push(
        {
          text: `${String(paginate.nextPage)}  >`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            action,
            goToPage: paginate.nextPage
          })
        })
    paginate.nextPage
      && lastPage > paginate.nextPage && menu[0].push(
        {
          text: `${String(lastPage)}  >>`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            action,
            goToPage: Math.ceil(paginate.count / numberOfResults)
          })
        })
    const message = fretes.map(frete => defaultMessages.frete.default(frete))


    message.push(defaultMessages.dateOfRequest.default())
    message.push('\n')


    return ctx.editMessageText(message.join('\n'), {
      reply_markup: {
        inline_keyboard: menu
      },
    });
  }
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

  sendMessage(chatId: string | number, message: string): void {
    this.bot.telegram.sendMessage(chatId, message)
  }
  async sendActionToAllUsers({ action, moreDetails, detailsParams, telegram_id, name }: ISendActionToAllUsers) {
    const telegram_users = await this.telegramUserRepository.find()
    const chats_ids = (await Promise.all(
      telegram_users?.map(async user => {
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

    chats_ids?.forEach(obj => {
      // if (obj.telegram_id != ctx.message.from.id) {
      if (obj.telegram_id != telegram_id) {
        this.bot.telegram.sendMessage(obj?.last_message?.chat_id, `${name} ${action}\n\n${defaultMessages[moreDetails].default(...detailsParams)}`)
      }
    })
  }
  getMenuAvailableDatesParameters = () => {
    const obj: MenuResponseParameters = {} as MenuResponseParameters
    const makeMessage = (res) => Object.keys(res?.dates)
      .map(date => {
        return `${date}:\n${res?.dates?.[date]?.map(defaultMessages.frete.default).join('')}`
      }
      ).join('') || defaultMessages.frete.noResults

    for (let index = 7; index > 0; index--) {
      const afterDate = getMonthAfterOrLaterCurrentMonth(index, false)
      obj[`${dateMonthYearWrited(afterDate)}`] = ({
        handleMessage: () => {
          return Promise.resolve(
            this.getFretes(`${afterDate.split('/')[0]}`, `${afterDate.split('/')[2]}`)
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
          this.getFretes(`${new Date().getMonth() + 1}`, `${new Date().getFullYear()}`
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
  }
  getFretes = (month: string, year: string) =>
    this.fretesService.getBusyDates(
      { busy: true, month, year }
    ).then(result => result)
  getMenuConsultOptions = () => {
    const obj: MenuResponseParameters = {} as MenuResponseParameters
    const makeMessage = (res) => Object.keys(res?.dates)
      .map(date => {
        return `\t\t\t${new Intl.DateTimeFormat('pt-br', {
          day: '2-digit', weekday: 'long', month: 'long', year: 'numeric'
        }).format(new Date(date)).toUpperCase()}:\n${res?.dates?.[date]?.map(defaultMessages.frete.default).join('')}`
      }
      ).join('\n\t\t==========================================\n\n\n') || defaultMessages.frete.noResults

    for (let index = 7; index > 0; index--) {
      const laterDate = getMonthAfterOrLaterCurrentMonth(index)
      const afterDate = getMonthAfterOrLaterCurrentMonth(index, false)
      obj[`${dateMonthYearWrited(laterDate)}`] = ({
        handleMessage: () => {
          return Promise.resolve(
            this.getFretes(`${laterDate.split('/')[0]}`, `${laterDate.split('/')[2]}`)
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
            this.getFretes(`${afterDate.split('/')[0]}`, `${afterDate.split('/')[2]}`)
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
          this.getFretes(`${new Date().getMonth() + 1}`, `${new Date().getFullYear()}`
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
  }
  menu: MenuResponse = {
    'Consulta': {
      message: 'Escolha uma das opções abaixo: ',
      handleReplyMarkup: (parameters) => ({
        keyboard: Object.keys(parameters).map(key => ([{ text: `Agendamentos - ${key}` }]))
      }),
      parameters: this.getMenuConsultOptions()
    },
    'Datas Livres': {
      message: 'Escolha uma das opções abaixo: ',
      handleReplyMarkup: (parameters) => ({
        keyboard: Object.keys(parameters).map(key => ([{ text: `Ver Datas Livres - ${key}` }]))
      }),
      parameters: this.getMenuAvailableDatesParameters()
    },
  }

  getAllSchedulingRequestsHomeButtons = async (ctx: TelegrafContext) => {
    const numberOfResults = 1
    const { fretes, paginate } = await this.fretesService.getSchedulingRequests({ numberOfResults, pageSelected: 1 });

    if (!fretes.length) {
      return ctx.reply("Não há Pedidos de Agendamento")
    }
    const message = fretes.map(frete => defaultMessages.frete.default(frete))
    const schedID = fretes[0].id
    const clienID = fretes[0].clientId
    const menu: InlineKeyboardButton[][] = [[], [], [], []]
    menu[0].push({
      text: 'Concluir Pedido de Agendamento',
      callback_data: generate_confirm_actions({
        action: 'ASK_BOOK_SCHED',
        targetId: schedID
      })
    })
    menu[1].push({
      text: 'Ver Detalhes do Cliente',
      callback_data: generate_confirm_actions({
        action: 'CLIENT_DETAILS',
        targetId: clienID
      })
    })
    menu[2].push(
      this.menuActionButtons.oneSchedulingDetails({ action: 'ONE_SCHED_DETAILS', id: schedID, customText: 'Ver Detalhes do Frete' })
    )
    paginate.prevPage
      && menu[3].push(
        {
          text: `<  ${String(paginate.prevPage)}`,
          callback_data: generate_paginate_actions(
            {
              action: 'ALL_SCHEDULINGS_REQUESTS',
              numberOfResults,
              goToPage: paginate.prevPage
            }
          )
        })
    // CONVERTER PARA JWT PQ SÓ ACEITA STRING DE ATÉ 64 BYTES
    paginate.nextPage
      && menu[3].push(
        {
          text: `${String(paginate.nextPage)}  >`,
          callback_data: generate_paginate_actions({
            numberOfResults,
            goToPage: paginate.nextPage,
            action: 'ALL_SCHEDULINGS_REQUESTS'
          })
        }
      )
    menu[3].push(
      {
        text: `${String(Math.ceil(paginate.count / numberOfResults))}  >>`,
        callback_data: generate_paginate_actions({
          numberOfResults,
          goToPage: Math.ceil(paginate.count / numberOfResults),
          action: 'ALL_SCHEDULINGS_REQUESTS'
        })
      }
    )
    message.push(defaultMessages.dateOfRequest.default())
    message.push('\n')
    ctx.reply(message.join('\n'), {
      reply_markup: {
        inline_keyboard: menu
      }
    })

    return message
  }

  generateConfirmActionMenu = (id: string, action: ExecuteActionCallbackName, details?: InlineKeyboardButton) => {
    const menu: InlineKeyboardButton[][] = [[], []]
    menu[0].push(
      {
        text: `Sim`,
        callback_data: generate_confirm_actions({
          targetId: id,
          action,
        })
      },
      {
        text: `Não`,
        callback_data: generate_confirm_actions({
          targetId: id,
          action: 'RETURN_TO',
        })
      }
    )
    if (details) {
      menu[1].push(details)
    }
    return menu
  }


  menuActionButtons = {
    oneSchedulingDetails: ({ action, id, customText }: { action: ExecuteActionCallbackName, id: string, customText?: string }) => ({
      text: customText || 'Ver Detalhes',
      callback_data: generate_confirm_actions({
        action,
        targetId: id
      })
    }),
    confirmScheduling: () => { },
    cancelScheduling: () => { },
    clientDetails: async (schedID: string, ctx: TelegrafContext) => { },
    askActionConfirmScheduling: async (schedID: string, ctx: TelegrafContext) => {
      const { frete } = await this.fretesService.getOne({ id: schedID })

      // Create navigation buttons of menu
      const menu = this.generateConfirmActionMenu(
        schedID,
        'CONFIRM_SCHED',
        this.menuActionButtons.oneSchedulingDetails(
          { action: 'ONE_SCHED_DETAILS', id: schedID }
        )
      )

      if (frete) {
        // // Create message Text
        const message = [
          defaultMessages.frete.default(frete),
          "Certeza que deseja confirmar?"
        ].join('\n')

        // Send message with menu
        return ctx.editMessageText(message, {
          reply_markup: {
            inline_keyboard: menu
          },
        });
      }
    },
    askActionCancelScheduling: async (schedID: string, ctx: TelegrafContext) => {
      const { frete } = await this.fretesService.getOne({ id: schedID })

      // Create navigation buttons of menu
      const menu = this.generateConfirmActionMenu(
        schedID,
        'CANCEL_SCHED',
        this.menuActionButtons.oneSchedulingDetails(
          { action: 'ONE_SCHED_DETAILS', id: schedID }
        )
      )
      if (frete) {
        // // Create message Text
        const message = [
          defaultMessages.frete.default(frete),
          "Certeza que deseja cancelar?"
        ].join('\n')

        // Send message with menu
        return ctx.editMessageText(message, {
          reply_markup: {
            inline_keyboard: menu
          },
        });
      }
    },
    askActionBookScheduling: async (schedID: string, ctx: TelegrafContext) => {
      const { frete } = await this.fretesService.getOne({ id: schedID })

      // Create navigation buttons of menu
      const menu = this.generateConfirmActionMenu(
        schedID,
        'BOOK_SCHED',
        this.menuActionButtons.oneSchedulingDetails(
          { action: 'ONE_SCHED_DETAILS', id: schedID }
        )
      )
      if (frete) {
        // // Create message Text
        const message = [
          defaultMessages.frete.default(frete),
          "O frete já foi marcado na agenda fisica?"
        ].join('\n')

        // Send message with menu
        return ctx.editMessageText(message, {
          reply_markup: {
            inline_keyboard: menu
          },
        });
      }
    },
  }

  generateDetailsActionMenu = (id, action: ExecuteActionCallbackName) => {
    const menu: InlineKeyboardButton[][] = [[], []]
    menu[0].push(this.menuActionButtons.oneSchedulingDetails({ action, id }))
    return menu
  }

  async getClientDetails(clienID: string, ctx: TelegrafContext) {
    const client = await this.clientsService.getOne({ id: clienID })
    return ctx.editMessageText(
      defaultMessages.client.default(client, client?.contacts),
      {
        // reply_markup: {
        //   inline_keyboard: [
        //     [
        //       {
        //         text: 'Ver agendamentos',
        //         callback_data: generate_confirm_actions({
        //           action: 'ALL_CLIENT_SCHEDULINGS',
        //         })
        //       }
        //     ]
        //   ]
        // }
      }
    )
  }

  async getOneSchedulingDetails(schedID: string, ctx: TelegrafContext) {
    const { frete } = await this.fretesService.getOne({ id: schedID })
    let message = defaultMessages.freteData.default(frete)
    message += defaultMessages.dateOfRequest.default()
    type TActionToDoInMessage = {
      [type in Partial<IState>]?: InlineKeyboardButton[][]
    }
    const infoButtons: InlineKeyboardButton[] = [
      {
        text: 'Preços',
        callback_data: generate_confirm_actions({
          action: 'PRICES_SCHED',
          targetId: frete?.id
        })
      },
      {
        text: 'Cliente',
        callback_data: generate_confirm_actions({
          action: 'CLIENT_DETAILS',
          targetId: frete?.clientId
        })
      }
    ]
    const setDetailsSchedulingButtons: TActionToDoInMessage = {
      "Pedido de Agendamento": [
        infoButtons,
        [
          {
            text: 'Concluir Pedido de Agendamento',
            callback_data: generate_confirm_actions({
              action: 'ASK_BOOK_SCHED',
              targetId: frete?.id
            })
          }
        ]
      ],
      "Marcada": [
        infoButtons,
        [
          {
            text: 'Cancelar',
            callback_data: generate_confirm_actions({
              action: 'ASK_CANCEL_SCHED',
              targetId: frete?.id
            })
          },
          {
            text: 'Confirmar',
            callback_data: generate_confirm_actions({
              action: 'ASK_CONFIRM_SCHED',
              targetId: frete?.id
            })
          }
        ]
      ],
      Cancelada: [infoButtons],
      Confirmada: [
        infoButtons,
        [
          {
            text: 'Cancelar',
            callback_data: generate_confirm_actions({
              action: 'ASK_CANCEL_SCHED',
              targetId: frete?.id
            })
          }
        ]
      ],
      Adiada: [
        infoButtons
      ]
    }
    let menu: InlineKeyboardButton[][] = []
    if (frete.state != undefined) {
      menu = setDetailsSchedulingButtons[frete.state]
    }

    const extra: ExtraReplyMessage = {
      reply_markup: {
        inline_keyboard: menu
      }
    }
    return { message, extra }
  }

  async bookScheduling(schedID, ctx: TelegrafContext) {
    if (!await this.fretesService.changeState(schedID, 'Marcada')) {
      ctx.reply('Erro ao executar a ação')
      return false
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
    return true
  }
}
