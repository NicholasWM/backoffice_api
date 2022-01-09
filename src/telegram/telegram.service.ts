import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from "@nestjs/config"
import { FretesService } from 'src/fretes/fretes.service';
import { Telegraf } from 'telegraf'
import * as TT from "telegram-typings";
import { convertCodesOfEmojisInEmojis, generateOptions, startOptions } from './helpers'
import { formatString } from '../utils/regex'
import { dateMonthDayYearWrited, dateMonthYearWrited } from '../utils/dateHelper'
import { ClientsService } from 'src/clients/clients.service';
import { GetBusyDatesResponse } from 'src/fretes/interfaces';
import { IContact } from 'src/clients/types';
const days = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
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
type ParseVCardResponse = {
  "version":"2.1",
  "fn":"1",
  "tel":{
    "meta":{
      "TYPE":string
    },
    "value":string[]
  }[]
}
function parseVCard(input):ParseVCardResponse {
  const Re1 = /^(version|fn|title|org):(.+)$/i;
  const Re2 = /^([^:;]+);([^:]+):(.+)$/;
  const ReKey = /item\d{1,2}\./;
  const fields = {} as ParseVCardResponse;

  input.split(/\r\n|\r|\n/).forEach(function (line) {
    let results, key;

    if (Re1.test(line)) {
      results = line.match(Re1);
      key = results[1].toLowerCase();
      fields[key] = results[2];
    } else if (Re2.test(line)) {
      results = line.match(Re2);
      key = results[1].replace(ReKey, '').toLowerCase();

      const meta = {};
      results[2].split(';')
        .map(function (p, i) {
          const match = p.match(/([a-z]+)=(.*)/i);
          if (match) {
            return [match[1], match[2]];
          } else {
            return ["TYPE" + (i === 0 ? "" : i), p];
          }
        })
        .forEach(function (p) {
          meta[p[0]] = p[1];
        });

      if (!fields[key]) fields[key] = [];

      fields[key].push({
        meta: meta,
        value: results[3].split(' ').join('').split('-').join('').split(';')
      })
    }
  });

  return fields;
};

@Injectable()
export class TelegramService implements OnModuleInit {
  constructor(
    private fretesService: FretesService,
    private clientsService: ClientsService,
    private configService: ConfigService
  ) { }
  private token = this.configService.get<string>('TELEGRAM_TOKEN');
  public bot = new Telegraf("1806857753:AAGrSlh_1m3jtQ2VZ3KO1QCa6aGlED_BgtA");
  sendMessage(chatId: string | number, message: string): void {
    this.bot.telegram.sendMessage(chatId, message)
  }

  message = ""

  options = {
    'InitialOptions': () => convertCodesOfEmojisInEmojis(startOptions),
    ...generateOptions()
  }

  onModuleInit() {
    const bookPages = 100;

    function getPagination(current, maxpage) {
      const keys = [];
      if (current > 1) keys.push({ text: `«1`, callback_data: '1' });
      if (current > 2) keys.push({ text: `‹${current - 1}`, callback_data: (current - 1).toString() });
      if (current < maxpage - 1) keys.push({ text: `${current + 1}›`, callback_data: (current + 1).toString() })
      if (current < maxpage) keys.push({ text: `${maxpage}»`, callback_data: maxpage.toString() });

      return {
        reply_markup: {
          inline_keyboard: [keys]
        }
      };
    }
    // this.bot.use(async (ctx, next)=> {
    //   console.log("Middleware", ctx.message.from)
    //   console.log("From", ctx.from)
    //   return next()
    // })
    
    this.bot.on('callback_query', (message) => {
      const pageNumber = message.callbackQuery.data
      message.editMessageText(`${pageNumber} \n `, getPagination(parseInt(message.callbackQuery.data), bookPages));
      return
    })
    this.bot.on('contact', async (ctx) => {
      console.dir(ctx.message.contact)
      const { first_name, user_id, phone_number, last_name } = ctx.message.contact
      const vCard = parseVCard(JSON.parse(JSON.stringify(ctx.message.contact)).vcard)
      const contacts: Pick<IContact, "desc" | "info">[] = vCard.tel.map((contact) => ({desc: contact.meta.TYPE, info: contact.value[0]}))
      const client = await this.clientsService.create({
        contacts,
        name: first_name,
      })
     console.log(client)
     ctx.reply(JSON.stringify(client))
      // this.clientsService.create()
    })
    this.bot.on('text', async (ctx) => {
      this.bot
     console.log(ctx.message.text)
     console.log(JSON.stringify(await ctx.tg.getUpdates(),null, 2))
      const getFretes = (month: string, year: string) => this.fretesService.getBusyDates({ busy: true, month, year })
        .then(result => result)
      const getMonthAfterOrLaterCurrentMonth = (numberOfMonths, later = true) => {
        const currentMonth = Number(new Intl.DateTimeFormat('pt-br', { month: '2-digit' }).format(new Date()))
        const currentDay = new Intl.DateTimeFormat('pt-br', { day: '2-digit' }).format(new Date())
        const currentYear = Number(new Intl.DateTimeFormat('pt-br', { year: 'numeric' }).format(new Date()))
        let month = Number(later ? currentMonth - numberOfMonths : currentMonth + numberOfMonths)
        let year = currentYear
        if (later) {
          month = currentMonth - numberOfMonths
          month += 12
          year--
        } else {
          month = currentMonth + numberOfMonths
        }
        return `${month}/${currentDay}/${year}`
      }

      const makeLinks = (keyword: string, id: string) => `/${keyword}${id?.split('-').join('')}`
      const defaultMessages = {
        frete: {
          noResults: "Nenhum Resultado encontrado!",
          default: (data) => `\tEstado: ${data?.state}\n\tBarqueiro: ${data?.boatman?.name}\n\tCliente: ${data?.client?.name}\n${makeLinks('sched', data?.id)}\n\n\n`
          // default: (data) => `\tEstado: ${data?.state}\n\tBarqueiro: ${data?.boatman?.name}\n\tCliente: ${data?.client?.name}\n\t/sched${data?.id?.split('-').join('')}\n\n\n`
        },
        copyPasteAvailableDates: {
          default: (dates, dayName: string) => {
            const message = `
          **🟢 Datas Disponiveis para *${dayName.toUpperCase()}* em ${new Intl.DateTimeFormat('pt-br', { month: 'long' }).format(new Date(dates[0]))}: 🟢**\n\n${dates.map(
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
                }).format(new Date())}_`.replace('-', '\\-')
            return message
          },
          noResults: "Nenhum barco livre."
        },
        daySchedulingsResume: {
          default: (fretes: GetBusyDatesResponse, dateEn: string) => {
            const message = [
              new Intl.DateTimeFormat("pt-br", { day: '2-digit', month: 'long', year: "numeric", weekday: 'long' }).format(new Date(dateEn)).toLocaleUpperCase(),
              `\n\nResumo:,`,
              `Marcada: ${fretes.counters?.Marcada},`,
              `Cancelada: ${fretes.counters?.Cancelada}`,
              `Confirmada: ${fretes.counters?.Confirmada}\n\n`,
              "Agendamentos:\n"
            ]
            Object.keys(fretes.dates)?.map((key: string, index) => {
              return `
              ${fretes.dates[key].map(
                scheduling => {
                  message.push(`*${index + 1}. Cliente: ${scheduling.client.name}*`)
                  message.push(`Status: ${scheduling.state}`)
                  message.push(`Dados do Cliente:\n${makeLinks('clien', scheduling.client.id)}\n`)
                  message.push(`Dados do Agendamento:\n${makeLinks('sched', scheduling.id)}\n\n\n`)
                }
              )}
               `
            })
            message.length < 7 && message.push("Nenhum frete agendado!")
            return message.join('\n')
          },
          noResults: "Nenhum Resultado encontrado!",
        }
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
                return `${date}:\n${res?.dates?.[date]?.map(defaultMessages.frete.default).join('')}`
              }
              ).join('') || defaultMessages.frete.noResults

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
        'Datas Livres': {
          message: 'Escolha uma das opções abaixo: ',
          handleReplyMarkup: (parameters) => ({
            keyboard: Object.keys(parameters).map(key => ([{ text: key }]))
          }),
          parameters: (() => {
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
        ctx.telegram.sendMessage(ctx.chat.id, 'Page: 25', getPagination(25, bookPages))
      } else {

        if (Object.keys(menu.Consulta.parameters).includes(ctx.message.text)) {
          const { message, parameters, handleReplyMarkup } = menu.Consulta
          Promise
            .resolve(parameters[ctx.message.text].handleMessage())
            .then(responseMessage => {
              ctx.reply(responseMessage, { reply_markup: parameters[ctx.message.text].handleReplyMarkup() })
            })
        }
        else if (ctx.message.text.substr(0, 6).includes('clien')) {
          const clienID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(6))
          this.clientsService.getOne({ id: clienID })
            .then((client) => {
              let message = `Informações do Cliente\n\nNome:${client?.name}\n\nContatos:\n${client.contacts.map(contact => `${contact?.description} - ${contact?.info}\n`)}\n`
              ctx.reply(message, {})
            })
        }
        else if (ctx.message.text.substr(0, 6).includes('sched')) {
          const schedID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(6))
          this.fretesService.getOne({ id: schedID })
            .then(({ frete }) => {
              let message = `\tDADOS DO AGENDAMENTO:\n\n${dateMonthDayYearWrited(frete.date.toISOString())}\n\nCliente:${frete.client.name}\n\nBarqueiro:${frete.boatman?.name}\n\nStatus:${frete.state}\n\nDeposito: R$${frete.depositPaid}\n\nNumero de Pessoas Combinado: ${frete.numberOfPeople}\n\nTabela de Preços:${frete.customPrice || frete?.prices?.map(price => `\n\n\t${price.description}\n\tPreço: R$${price.value}\n`)}\n\nCliente:\nNome:${frete.client.name}\n\n\n Clique abaixo para consultar dados do Cliente:\n/clien${frete.clientId.split('-').join('')}`
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
              ctx.reply(defaultMessages.daySchedulingsResume.default(fretes, dateEn), {
                parse_mode: 'Markdown',
                reply_markup: {
                  keyboard: [
                    [{ text: `Pedido de Agendamento - ${dateBr}` }],
                    [{ text: `Ver Datas Livres - ${dateBr.split('/')[1]}/${dateBr.split('/')[2]} - ${new Intl.DateTimeFormat('pt-br', { month: 'long' }).format(new Date(dateEn))}` }],
                    [{ text: `Datas Livres` }],
                  ]
                }
              })

            })
        }
        else if (ctx.message.text.includes("Verificar disponibilidade: ")) {
          const day = ctx.message.text.split(':')[1].split('-')[0].trim()
          const [month, year] = ctx.message.text.split('-')[1].trim().split('/')

          this.fretesService.getAvailableDates({ month: Number(month), year: Number(year) })
            .then((response) => {
              const responseData = Object.keys(response).find(key => key.toUpperCase() === day.toUpperCase())
              const monthName = new Intl.DateTimeFormat('pt-br', { month: 'long' }).format(new Date(response[responseData][0]))

              ctx.reply(
                defaultMessages.copyPasteAvailableDates.default(response[responseData], day)
                , {
                  parse_mode: 'MarkdownV2',
                  reply_markup: {
                    keyboard: [[{ text: `Ver Datas Livres - ${month}/${year} - ${monthName}` }], ...response[responseData].map(day => {
                      const dayBrFormat = []
                      dayBrFormat.push(day.split('/')[1])
                      dayBrFormat.push(day.split('/')[0])
                      dayBrFormat.push(day.split('/')[2])
                      return [`Visualizar data: ${new Intl.DateTimeFormat('pt-br', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(day))} - ${dayBrFormat.join('/')}`]
                    })]
                  }
                })
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
              keyboard: [[{ text: "Datas Livres" }], ...days.map(day => [{ text: `Verificar disponibilidade: ${day} - ${month}/${year}` }])]
            }
          })
        }
        else if (ctx.message.text.includes("Pedido de Agendamento - ")) {
          ctx.reply("Qual o contato do Cliente?")
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
              ]
            }
          })

        }
      }
    })
    this.bot.launch()
  }
}