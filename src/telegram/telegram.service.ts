import { Injectable,OnModuleInit } from '@nestjs/common';
import {ConfigService} from "@nestjs/config"
import { FretesService } from 'src/fretes/fretes.service';
import { Telegraf  } from 'telegraf'
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { convertCodesOfEmojisInEmojis, emojis, generateOptions, parseResponseEmojis, startOptions } from './helpers'

@Injectable()
export class TelegramService implements OnModuleInit{
  constructor(
    private fretesService: FretesService,
    private configService: ConfigService
  ) {}
  private token=this.configService.get<string>('TELEGRAM_TOKEN');
  
  public bot = new Telegraf(this.token)
  sendMessage(chatId:string|number,message:string):void{
    this.bot.telegram.sendMessage(chatId,message)
  }    
  
  message = ""

  options = {
    'InitialOptions': ()=>convertCodesOfEmojisInEmojis(startOptions),
    ...generateOptions()
  }

  onModuleInit() {
    let bookPages = 100;

    function getPagination( current, maxpage ) {
      let keys = [];
      if (current>1) keys.push({ text: `«1`, callback_data: '1' });
      if (current>2) keys.push({ text: `‹${current-1}`, callback_data: (current-1).toString() });
      // keys.push({ text: `-${current}-`, callback_data: current.toString() });
      if (current<maxpage-1) keys.push({ text: `${current+1}›`, callback_data: (current+1).toString() })
      if (current<maxpage) keys.push({ text: `${maxpage}»`, callback_data: maxpage.toString() });

      return {
        reply_markup: {
          inline_keyboard: [ keys ]
        }
      };
    }

    // this.bot.on('callback_query', (message)=>{
    //   let pageNumber = message.callbackQuery.data
    //   message.editMessageText(`Page ${pageNumber} \n /Option1`, getPagination(parseInt(message.callbackQuery.data), bookPages));
    //   return
    // })
    this.bot.on('callback_query', (message)=>{
      console.log('data',message.callbackQuery.data)
      console.log('text',message.callbackQuery.message.text)
      // console.log(message.chat.title)
      // console.log(message.editMessageText)
      let pageNumber = message.callbackQuery.data
      message.editMessageText(`${pageNumber} \n `, getPagination(parseInt(message.callbackQuery.data), bookPages));
      return
    })
    this.bot.on('contact', (contact) => {
      console.log(contact.message.contact)
    })
    this.bot.on('text', (ctx) => {
      // console.log(ctx.message.from)

      // this.fretesService.getBusyDates({busy:true, year:'2021'})
      //   .then(result => console.log(result))
      let getFretes = (month:string, year:string)=> this.fretesService.getBusyDates({busy:true, month, year})
        .then(result => result)
      let consultas = {
        'Consulta':{
          '01/2021 Janeiro':() => getFretes('01', '2021'),
          '02/2021 Fevereiro':() => getFretes('02', '2021'),
          '03/2021 Marco':() => getFretes('03', '2021'),
          '04/2021 Abril':() => getFretes('04', '2021'),
          '05/2021 Maio':() => getFretes('05', '2021'),
          '06/2021 Junho':() => getFretes('06', '2021'),
          '07/2021 Julho':() => getFretes('07', '2021'),
          '08/2021 Agosto':() => getFretes('08', '2021'),
          '09/2021 Setembro':() => getFretes('09', '2021'),
          '10/2021 Outubro':() => getFretes('10', '2021'),
          '11/2021 Novembro':() => getFretes('11', '2021'),
          '12/2021 Dezembro':() => getFretes('12', '2021'),
          '01/2022 Janeiro':() => getFretes('01', '2022'),
          '02/2022 Fevereiro':() => getFretes('02', '2022'),
          '03/2022 Marco':() => getFretes('03', '2022'),
          '04/2022 Abril':() => getFretes('04', '2022'),
          '05/2022 Maio':() => getFretes('05', '2022'),
          '06/2022 Junho':() => getFretes('06', '2022'),
          '07/2022 Julho':() => getFretes('07', '2022'),
          '08/2022 Agosto':() => getFretes('08', '2022'),
          '09/2022 Setembro':() => getFretes('09', '2022'),
          '10/2022 Outubro':() => getFretes('10', '2022'),
          '11/2022 Novembro':() => getFretes('11', '2022'),
          '12/2022 Dezembro':() => getFretes('12', '2022'),
        }
      } 
      console.log(ctx.message)
      if(ctx.message.text === 'Page'){
        ctx.telegram.sendMessage(ctx.chat.id, 'Page: 25', getPagination(25,bookPages))
      }else{
        // const text = parseResponseEmojis(ctx.message.text)
        // const keys = Object.keys(this.options)
        // let questions:{textMessage?: string, extra?: ExtraReplyMessage} = this.options?.InitialOptions()
        // if(keys.includes(text)){

        //   questions = this.options[text]()
        //   this.message = `${this.message}${text}`
        // }
        console.log(this.message);
        if(Object.keys(consultas.Consulta).includes(ctx.message.text)){
          Promise
            .resolve(consultas.Consulta[ctx.message.text]())
            .then(res => {
              // console.log(Object.keys(res?.dates))
              let message = Object.keys(res?.dates)
                .map(date => 
                  `${date}:\n ${res?.dates?.[date]
                              ?.map(data => 
                                `\n\t\t\t${data?.state}\n\t\t\t\t\t\tBarqueiro: ${data?.boatman?.name}\n\t\t\t\t\t\tCliente: ${data?.client?.name}\n`).join('')}\n`
              ).join('')
              ctx.reply(message, {
                reply_markup:{
                  keyboard:[
                    [{text:"Consulta"}],
                    [{text:"Datas Livres"}],
                  ]
                }
              })
            })
          console.log(Object.keys(consultas.Consulta[ctx.message.text]));
          
          
        }else if(ctx.message.text === 'Consulta'){
          ctx.reply('asd', {
            reply_markup:{
              keyboard:Object.keys(consultas.Consulta).map(key => ([{text:key}]))
              
            }
          })
        }else{
          ctx.reply('Escolha uma Opção:', {
            reply_markup:{
              keyboard:[
                [{text:"Consulta"}],
                [{text:"Datas Livres"}],
              ]
            }
          })

        }
        // ctx.reply(questions?.textMessage, {...questions?.extra})
      }
    })
    this.bot.launch()
  }
}