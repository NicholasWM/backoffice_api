import { Boatman } from "src/boatman/entities/boatman.entity"
import { Client } from "src/clients/clients.entity"
import { Contact } from "src/contacts/entities/contact.entity"
import { Frete } from "src/fretes/fretes.entity"
import { GetBusyDatesResponse, DateBusy } from "src/fretes/interfaces"
import { IState } from "src/fretes/types"
import { dateMonthDayYearWrited } from "src/utils/dateHelper"
import * as tt  from "telegraf/typings/telegram-types"
import { IDefaultMessages, ParseVCardResponse } from "../types"

export const emojis = {
  '[00]':'0️⃣ ',
  '[01]':'1️⃣ ',
  '[02]':'2️⃣ ',
  '[03]':'3️⃣ ',
  '[04]':'4️⃣ ',
  '[05]':'5️⃣ ',
  '[06]':'6️⃣ ',
  '[07]':'7️⃣ ',
  '[08]':'8️⃣ ',
  '[09]':'9️⃣ ',
  '[10]':'🔟 ',
  '[11]':'🟥 ',
  '[13]':'🟧 ',
  '[14]':'🟨 ',
  '[15]':'🟩 ',
  '[23]':' 📆🎣',
  '[19]':'🎣📆 ',
  '[20]':'📆🟥 ',
  '[21]':'📆🟩 ',
  '[22]':'📆🟦 ',
  '[16]':'🟦 ',
  '[17]':'🎣 ',
  '[18]':'📆 ',
}

export const monthMessage = "Qual Mes?"
export const months = {
  textMessage:monthMessage, 
  extra:{
    reply_markup:{
      keyboard:[
        [{text:'[18] Janeiro'}],
        [{text:'[18] Fevereiro'}],
        [{text:'[18] Março'}],
        [{text:'[18] Abril'}],
        [{text:'[18] Maio'}],
        [{text:'[18] Junho'}],
        [{text:'[18] Julho'}],
        [{text:'[18] Agosto'}],
        [{text:'[18] Setembro'}],
        [{text:'[18] Outubro'}],
        [{text:'[18] Novembro'}],
        [{text:'[18] Dezembro'}],
      ]
    }
  },
}

export const dayMessage = "Qual tipo de dia?"
export const typeOfDay = {
  textMessage:dayMessage,
  extra:
    {
      reply_markup:{
        keyboard:[
          [{'text': '[00] Ver todas'}],
          [{'text': '[01] Dias de Semana'}],
          [{'text': '[02] Final de Semana'}],
          [{'text': '[03] Sabados'}],
          [{'text': '[04] Domingos'}],
          [{'text': '[05] Segunda'}],
          [{'text': '[06] Terça'}],
          [{'text': '[07] Quarta'}],
          [{'text': '[08] Quinta'}],
          [{'text': '[09] Sexta'}],
          [{'text': '[10] Sabado'}],
        ]
      }
    }
}

export const availableDayMessage = "Qual dia?"
export const availableDays = {
  textMessage:availableDayMessage, 
  extra:
    {
      reply_markup:{
      keyboard:
        [
          [{'text': '[21] Terça 03/02/2021'}],
          [{'text': '[20] Segunda 01/02/2021'}],
          [{'text': '[21] Quarta 04/02/2021'}],
          [{'text': '[22] Quinta 05/02/2021'}],
        ],
      }
    },
}
export const parseResponseEmojis = (textMessage) => {
  let finaltext = textMessage
  Object.keys(emojis).forEach(emoji => {
    if(finaltext.includes(emojis[emoji])){
      finaltext = finaltext.replace(emojis[emoji], emoji)
    }
  });
  return finaltext
}
export const startMessage = "Escolha uma das opções:"
export const startOptions:{textMessage:string, extra:any} = {
  textMessage:startMessage,
  extra:
    {
      reply_markup:{
        keyboard:
          [
            [{'text': '[19] Consulta [23]'}],
          ],
        }
    },
}

export const convertCodesOfEmojisInEmojis = (options)=>{
  let keyboard = []
  options.extra.reply_markup.keyboard.forEach(element => {
    
    let finalText = element[0].text
    Object.keys(emojis).forEach(emoji => {
      if(finalText.includes(emoji)){
        finalText = finalText.replace(emoji, emojis[emoji])
      }
    });
    
    keyboard.push([finalText])
  });
  return {...options ,extra:{reply_markup:{keyboard}}}
}

export const optionsCallbackFunctions = {
  '[19]': ()=> convertCodesOfEmojisInEmojis(months), // Opção Consulta
  '[20]': ()=> convertCodesOfEmojisInEmojis(startOptions), // Dia
  '[21]': ()=> convertCodesOfEmojisInEmojis(startOptions), // Dia
  '[22]': ()=> convertCodesOfEmojisInEmojis(startOptions), // Dia
  '[18]': ()=> convertCodesOfEmojisInEmojis(typeOfDay),  // Mes
  '[00]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day 
  '[01]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day 
  '[02]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day 
  '[03]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day 
  '[04]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day 
  '[05]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day 
  '[06]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day 
  '[07]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day 
  '[08]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day 
  '[09]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day 
  '[10]': ()=> convertCodesOfEmojisInEmojis(availableDays), // Type of Day
}

export const generateOptions = function(){
  const options = [startOptions, availableDays, typeOfDay, months]
  let generatedOptions = {}
  options.forEach(option => option.extra.reply_markup.keyboard.map(item=> {
    generatedOptions[item[0].text] = optionsCallbackFunctions[item[0].text.substring(0,4)]
  }))
  return generatedOptions
}

export function getPagination(current, maxpage) {
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

export const makeLinks = (keyword: string, id: string) => `/${keyword}${id?.split('-').join('')}`

export function parseVCard(input): ParseVCardResponse {
  const Re1 = /^(version|fn|title|org):(.+)$/i;
  const Re2 = /^([^:;]+);([^:]+):(.+)$/;
  const ReKey = /item\d{1,2}\./;
  const fields = {} as ParseVCardResponse;

  input?.split(/\r\n|\r|\n/).forEach(function (line) {
    let results, key;

    if (Re1.test(line)) {
      results = line.match(Re1);
      key = results[1].toLowerCase();
      fields[key] = results[2];
    } else if (Re2.test(line)) {
      results = line.match(Re2);
      key = results[1].replace(ReKey, '').toLowerCase();

      const meta = {};
      results[2]?.split(';')
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
        value: results[3]?.split(' ')?.join('')?.split('-')?.join('')?.split(';')
      })
    }
  });

  return fields;
};

export const getMonthAfterOrLaterCurrentMonth = (numberOfMonths, later = true) => {
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
    if (month == 0) {
      month = 12
      year--
    }
    else if (month < 0) {
      month += 12
      year--
      if (month == 0) {
        month = 12
        year++
      }
    }
    else if (month > 12) {
      month = 12 - numberOfMonths
      year++
      if (month == 0) {
        month = 12
        year--
      }
    }
  } else {
    if (month > 12) {
      month -= 12
      year++
    }
  }
  return `${month}/${currentDay}/${year}`
}

export const defaultMessages: IDefaultMessages = {
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
  freteLink: {
    default: (id) => `ℹ️  Dados do Agendamento  ℹ️\n${makeLinks('sched', id)}\n\n`
  },
  frete: {
    noResults: "Nenhum Resultado encontrado!",
    default: (data: Frete) => {
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
      const modifyMessagePerActionType: TActionToDoInMessage = {
        'Confirmada': (msg) => {
          msg.push(`\n\nClique para cancelar o agendamento:\n`)
          msg.push(`\n❌${makeLinks('cancelsch', frete.id)}\n`)
        },
        'Marcada': (msg) => {
          msg.push(`\n\nClique para confirmar o agendamento:\n`)
          msg.push(`\n✅${makeLinks('confirmsch', frete.id)}`)
          msg.push(`\n\nClique para cancelar o agendamento:\n`)
          msg.push(`\n❌${makeLinks('cancelsch', frete.id)}\n`)
        },
        'Pedido de Agendamento': (msg) => {
          msg.push(`\n\nJá marcou na agenda?`)
          msg.push(`\nClique para concluir o Pedido de Agendamento:\n`)
          msg.push(`\n${makeLinks('booksch', frete.id)}\n`)
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
    default: () => 'Associar Telegram',
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
    default: () => `\n========================================\n📌  Dados consultados em ${new Intl.DateTimeFormat('pt-br', { day: '2-digit', year: 'numeric', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date())}  📌\n========================================`
  },
  schedulingRequest: {
    default: () => `Existem pedidos de agendamento em aberto!\n\n Clique aqui para visualizar os pedidos em aberto: \n\n /VerPedidosDeAgendamento`,
    noResults: ""
  }
}