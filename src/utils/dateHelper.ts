import { Frete } from "src/fretes/fretes.entity"

export const translatorMessages = {
  'app.of':{
    en:'of',
    pt:'de',
  },
  'app.date':{
    en:'Date',
    pt:'Data',
  },
  'app.day':{
    en:'Day',
    pt:'Dia',
  },
  'app.month':{
    en:'Month',
    pt:'Mês',
  },
  'app.months.Jan':{
    en:'January',
    pt:'Janeiro',
  },
  'app.months.Feb':{
    en:'February',
    pt:'Fevereiro',
  },
  'app.months.Mar':{
    en:'March',
    pt:'Março',
  },
  'app.months.Apr':{
    en:'April',
    pt:'Abril',
  },
  'app.months.May':{
    en:'May',
    pt:'Maio',
  },
  'app.months.Jun':{
    en:'June',
    pt:'Junho',
  },
  'app.months.Jul':{
    en:'July',
    pt:'Julho',
  },
  'app.months.Aug':{
    en:'August',
    pt:'Agosto',
  },
  'app.months.Sep':{
    en:'September',
    pt:'Setembro',
  },
  'app.months.Oct':{
    en:'October',
    pt:'Outubro',
  },
  'app.months.Nov':{
    en:'November',
    pt:'Novembro',
  },
  'app.months.Dec':{
    en:'December',
    pt:'Dezembro',
  },
  'app.days.Sun':{
    en:'Sunday',
    pt:'Domingo',
  },
  'app.days.Mon':{
    en:'Monday',
    pt:'Segunda-feira',
  },
  'app.days.Tue':{
    en:'Tuesday',
    pt:'Terça-feira',
  },
  'app.days.Wed':{
    en:'Wednesday',
    pt:'Quarta-feira',
  },
  'app.days.Thu':{
    en:'Thursday',
    pt:'Quinta-feira',
  },
  'app.days.Fri':{
    en:'Friday',
    pt:'Sexta-feira',
  },
  'app.days.Sat':{
    en:'Saturday',
    pt:'Sabado',
  },
}

export const dateMonthDayYearWrited = (date:string) => {
    let [day, month, dayNumber, year] = new Date(date).toDateString().split(' ')
    return `${translatorMessages['app.days.' + day]['pt']} - ${translatorMessages['app.day']['pt']} ${dayNumber} ${translatorMessages['app.of']['pt']} ${translatorMessages['app.months.'+ month]['pt']} ${translatorMessages['app.of']['pt']} ${year}`
}
export const dateMonthYearWrited = (date:string) => {
    let [day, month, dayNumber, year] = new Date(date).toDateString().split(' ')
    if(new Date(date).toDateString() == 'Invalid Date'){
      console.log("Invalid: ", date);
      
      return ''
    }
    return `${date.split('/')[0]}/${year} - ${translatorMessages['app.months.'+ month]['pt']}`
    // return `${date.split('/')[0]}/${year} - ${new Intl.DateTimeFormat('pt-br', {month:'long'}).format(new Date(date))}`
}

export const getAllDaysInMonth = (month, year) => Array.from(
  {length: new Date(year, month - 1, 0).getDate() - 1},
    (_, i) => new Date(year, month - 1, i + 1)
  ).map(x => x.toLocaleDateString())

export const dateFrequency = <Type extends {date: Date}>(data: Type[]) => data
  .map(item=>item.date.toLocaleDateString())
  .reduce(function(prev, cur) {
    prev[cur] = (prev[cur] || 0) + 1;
    return prev;
}, {})