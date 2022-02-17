// import { Injectable,OnModuleInit } from '@nestjs/common';
// import {ConfigService} from "@nestjs/config"
// import { FretesService } from 'src/fretes/fretes.service';
// import { Telegraf  } from 'telegraf'
// import * as TT from "telegram-typings";
// import { convertCodesOfEmojisInEmojis, emojis, generateOptions, parseResponseEmojis, startOptions } from './helpers'
// import {formatString} from '../utils/regex'
// import {dateMonthDayYearWrited, dateMonthYearWrited} from '../utils/dateHelper'
// import { ClientsService } from 'src/clients/clients.service';
// import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
// @Injectable()
// export class TelegramService implements OnModuleInit{
//   constructor(
//     private fretesService: FretesService,
//     private clientsService: ClientsService,
//     private configService: ConfigService
//   ) {}
//   private token=this.configService.get<string>('TELEGRAM_TOKEN');
//   // public bot = new Telegraf(this.token);
//   public bot = new Telegraf("1806857753:AAGrSlh_1m3jtQ2VZ3KO1QCa6aGlED_BgtA");
//   sendMessage(chatId:string|number,message:string):void{
//     this.bot.telegram.sendMessage(chatId,message)
//   }    
  
//   message = ""

//   options = {
//     'InitialOptions': ()=>convertCodesOfEmojisInEmojis(startOptions),
//     ...generateOptions()
//   }

//   onModuleInit() {
//     const bookPages = 100;
//     function getPagination( current, maxpage ) {
//       const keys = [];
//       if (current>1) keys.push({ text: `«1`, callback_data: '1' });
//       if (current>2) keys.push({ text: `‹${current-1}`, callback_data: (current-1).toString() });
//       // keys.push({ text: `-${current}-`, callback_data: current.toString() });
//       if (current<maxpage-1) keys.push({ text: `${current+1}›`, callback_data: (current+1).toString() })
//       if (current<maxpage) keys.push({ text: `${maxpage}»`, callback_data: maxpage.toString() });

//       return {
//         reply_markup: {
//           inline_keyboard: [ keys ]
//         }
//       };
//     }

//     // this.bot.on('callback_query', (message)=>{
//     //   let pageNumber = message.callbackQuery.data
//     //   message.editMessageText(`Page ${pageNumber} \n /Option1`, getPagination(parseInt(message.callbackQuery.data), bookPages));
//     //   return
//     // })
//     this.bot.on('callback_query', (message)=>{
//       const pageNumber = message.callbackQuery.data
//       message.editMessageText(`${pageNumber} \n `, getPagination(parseInt(message.callbackQuery.data), bookPages));
//       return
//     })
//     // this.bot.on('contact', (contact) => {
//     // })
//     this.bot.on('text', async (ctx) => {
//       // console.log(ctx.message.from)

//       // this.fretesService.getBusyDates({busy:true, year:'2021'})
//       //   .then(result => console.log(result))
//       const getFretes = (month:string, year:string)=> this.fretesService.getBusyDates({busy:true, month, year})
//         .then(result => result)
//       const consultas = {
//         'Consulta':{
//           '01/2021 Janeiro':() => getFretes('01', '2021'),
//           '02/2021 Fevereiro':() => getFretes('02', '2021'),
//           '03/2021 Marco':() => getFretes('03', '2021'),
//           '04/2021 Abril':() => getFretes('04', '2021'),
//           '05/2021 Maio':() => getFretes('05', '2021'),
//           '06/2021 Junho':() => getFretes('06', '2021'),
//           '07/2021 Julho':() => getFretes('07', '2021'),
//           '08/2021 Agosto':() => getFretes('08', '2021'),
//           '09/2021 Setembro':() => getFretes('09', '2021'),
//           '10/2021 Outubro':() => getFretes('10', '2021'),
//           '11/2021 Novembro':() => getFretes('11', '2021'),
//           '12/2021 Dezembro':() => getFretes('12', '2021'),
//           '01/2022 Janeiro':() => getFretes('01', '2022'),
//           '02/2022 Fevereiro':() => getFretes('02', '2022'),
//           '03/2022 Marco':() => getFretes('03', '2022'),
//           '04/2022 Abril':() => getFretes('04', '2022'),
//           '05/2022 Maio':() => getFretes('05', '2022'),
//           '06/2022 Junho':() => getFretes('06', '2022'),
//           '07/2022 Julho':() => getFretes('07', '2022'),
//           '08/2022 Agosto':() => getFretes('08', '2022'),
//           '09/2022 Setembro':() => getFretes('09', '2022'),
//           '10/2022 Outubro':() => getFretes('10', '2022'),
//           '11/2022 Novembro':() => getFretes('11', '2022'),
//           '12/2022 Dezembro':() => getFretes('12', '2022'),
//         },
//         'Datas Livres': {

//         }
//       } 
//       const getMonthAfterOrLaterCurrentMonth = (numberOfMonths, later=true) => 
//         later ? new Date(new Date().setMonth(new Date().getMonth() - numberOfMonths)).toLocaleDateString()
//           : new Date(new Date().setMonth(new Date().getMonth() + numberOfMonths)).toLocaleDateString()

//       interface MenuResponseParameters {
//         handleMessage: () => any;
//         handleReplyMarkup?: ()=> TT.InlineKeyboardMarkup | TT.ReplyKeyboardMarkup | TT.ReplyKeyboardRemove | TT.ForceReply
//       }

//       interface MenuResponse {
//         [date: string]: {
//           message: string;
//           handleReplyMarkup: any;
//           parameters: {
//             [parameter:string]: MenuResponseParameters
//           }
//         };
//       }
//       const menu:MenuResponse = {
//         'Consulta':{
//           message:'asd',
//           handleReplyMarkup: (parameters)=> ({
//             keyboard:Object.keys(parameters).map(key => ([{text:key}]))
//           }),
//           parameters: (()=>{
//             const obj:MenuResponseParameters = {} as MenuResponseParameters
//             const makeMessage = (res) => Object.keys(res?.dates)
//               .map(date => 
//                 `${date}:\n ${res?.dates?.[date]
//                   ?.map(data => 
//                     `\tData: ${data?.state}\n\t Barqueiro: ${data?.boatman?.name}\n\t Cliente: ${data?.client?.name}\n\t /sched${data?.id?.split('-').join('')}
//                     \n `).join('')}`
//               ).join('')
          
//             for (let index = 7; index > 0; index--) {
//               const laterDate = getMonthAfterOrLaterCurrentMonth(index)
//               const afterDate = getMonthAfterOrLaterCurrentMonth(index, false)
//               obj[`${dateMonthYearWrited(laterDate)}`] = ({
//                 handleMessage: () => {
//                   return Promise.resolve(
//                     getFretes(`${new Date(laterDate).getMonth()+ 1}`, `${new Date(laterDate).getFullYear()}`)
//                   ).then(res => makeMessage(res))
//                 },
//                 handleReplyMarkup: ()=> {
//                   return {
//                     keyboard:[]
//                   }
//                 }
//               })
//               obj[`${dateMonthYearWrited(afterDate)}`] = ({
//                 handleMessage: () => {
//                   return Promise.resolve(
//                     getFretes(`${new Date(afterDate).getMonth()+ 1}`, `${new Date(afterDate).getFullYear()}`)
//                   ).then(res => makeMessage(res))
//                 },
//                 handleReplyMarkup: ()=> {
//                   return {
//                     keyboard:[]
//                   }
//                 }
//               })
//             }
//             obj[dateMonthYearWrited(new Date().toLocaleDateString())] = {
//               handleMessage: () => {
//                 return Promise.resolve(
//                   getFretes(`${new Date().getMonth()+ 1}`, `${new Date().getFullYear()}`
//                 ).then(res => makeMessage(res))
//                 )
//               },
//               handleReplyMarkup: ()=> {
//                 return {
//                   keyboard:[]
//                 }
//               }
//             }
//             const reordered = (()=>{
//               const finalObj = {} 
//               Object.keys(obj)
//                 .sort((a,b) => {
//                   if(Number(a.split('-')[0].split('/')[1]) < Number(b.split('-')[0].split('/')[1])) return -1
//                   if(Number(a.split('-')[0].split('/')[1]) > Number(b.split('-')[0].split('/')[1])) return 1
//                   return 0
//                 })
//                 .sort((a,b) => {
//                   if(Number(a.split('-')[0].split('/')[1]) === Number(b.split('-')[0].split('/')[1])){
//                     if(Number(a.split('-')[0].split('/')[0]) < Number(b.split('-')[0].split('/')[0])) return -1
//                     if(Number(a.split('-')[0].split('/')[0]) > Number(b.split('-')[0].split('/')[0]))return 1
//                   }
//                   return 0
//                 }
//               ).forEach(item => {finalObj[item]= obj[item]})
//               return finalObj
//             }
//             )()
//             console.log("reordered  ", reordered);
            
//             return reordered
//           })()
//         },
//         // 'Datas Livres':{},
//         // 'Agendamento':{},
//         // 'Clientes':{},
//       }
//       if(ctx.message.text === 'Page'){
//         ctx.telegram.sendMessage(ctx.chat.id, 'Page: 25', getPagination(25,bookPages))
//       }else{
//         // const text = parseResponseEmojis(ctx.message.text)
//         // const keys = Object.keys(this.options)
//         // let questions:{textMessage?: string, extra?: ExtraReplyMessage} = this.options?.InitialOptions()
//         // if(keys.includes(text)){

//         //   questions = this.options[text]()
//         //   this.message = `${this.message}${text}`
//         // }
//         if(Object.keys(menu.Consulta.parameters).includes(ctx.message.text)){
//           const {message, parameters, handleReplyMarkup} = menu.Consulta
//           Promise
//             .resolve(parameters[ctx.message.text].handleMessage())
//             .then(responseMessage => {
//               ctx.reply(responseMessage, {reply_markup:parameters[ctx.message.text].handleReplyMarkup()})
//             })
//         }
//         else if(ctx.message.text.substr(0,6).includes('clien')){
//           const clienID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(6))
//           this.clientsService.getOne({id:clienID})
//           .then((client) => {
//             let message=`Informações do Cliente\n\nNome:${client?.name}\n\nContatos:\n${client.contacts.map(contact=> `${contact?.description} - ${contact?.info}\n`)}\n`
//             ctx.reply(message,{})
//           })
//         }
//         else if(ctx.message.text.substr(0,6).includes('sched')){
//           const schedID = formatString('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', ctx.message.text.substr(6))
//           this.fretesService.getOne({id:schedID})
//           .then(({frete}) => {
//             let message = `\tDADOS DO AGENDAMENTO:\n\n${dateMonthDayYearWrited(frete.date.toISOString())}\n\nCliente:${frete.client.name}\n\nBarqueiro:${frete.boatman?.name}\n\nStatus:${frete.state}\n\nDeposito: R$${frete.depositPaid}\n\nNumero de Pessoas Combinado: ${frete.numberOfPeople}\n\nTabela de Preços:${frete.customPrice || frete?.prices?.map(price => `\n\n\t${price.description}\n\tPreço: R$${price.value}\n`)}\n\nCliente:\nNome:${frete.client.name}\n\n\n Clique abaixo para consultar dados do Cliente:\n/clien${frete.clientId.split('-').join('')}`
//             ctx.reply(message,{})
//           })
//         }
//         else if(ctx.message.text === 'Datas Livres'){
//           ctx.reply('Selecione a opção desejada:', {
//             reply_markup:{
//               keyboard:Object.keys(menu.Consulta.parameters).map(key => ([{text:`Ver Datas Livres - ${key}`}]))
//             }
//           })
//         }
//         else if(Object.keys(menu.Consulta.parameters).map(dataString => `Ver Datas Livres - ${dataString}`).includes(ctx.message.text)){
//           const {month, monthName, year} = (()=> {
//             let [date, monthName] = ctx.message.text.replace("Ver Datas Livres - ","").split(" ")
//             let [month,year] = date.split('/').map(data => Number(data))
//             return {month, year, monthName}
//           })()
//           this.fretesService.getAvailableDates({month, year})
//             .then((response) => {
//               ctx.reply(`Mostrando datas Livres: \n ${Object.keys(response).map(key => `\n${key}s livres:\n\n ${response[key].map(date => `\t${date}\n`)}`).join('').split(',').join('\n\t\t')}\n\n`, {
//                 reply_markup:{
//                   keyboard:Object.keys(consultas.Consulta).map(key => ([{text:`Ver Datas Livres - ${key}`}]))
//                 }
//               })
//             })
//         }
        
//         // else if(ctx.message.text === 'Consulta'){
//         else if(Object.keys(menu).includes(ctx.message.text)){
//           const {message, parameters, handleReplyMarkup} = menu[ctx.message.text]
//           ctx.reply(message, {
//             reply_markup: handleReplyMarkup(parameters)
//           })
//           // ctx.reply('asd', {
//           //   reply_markup:{
//           //     keyboard:Object.keys(consultas[parameter]).map(key => ([{text:key}]))
//           //   }
//           // })
//         }else{
//           ctx.reply('Comando desconhecido, favor tentar novamente', {
//             reply_markup:{
//               keyboard:[
//                 [{text:"Consulta"}],
//                 [{text:"Datas Livres"}],
//               ]
//             }
//           })

//         }
//         // ctx.reply(questions?.textMessage, {...questions?.extra})
//       }
//     })
//     this.bot.launch()
//   }
// }