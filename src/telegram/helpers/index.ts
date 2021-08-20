import * as tt  from "telegraf/typings/telegram-types"

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
