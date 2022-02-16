import { Frete_Image } from "src/images/frete-images.entity";
import {  PaginateResponse } from "src/utils/pagination";
import { Frete } from "../fretes.entity";
import { IState } from "../types";

export type DateBusy = Pick<Frete, 'date'| 'id' | 'state' | 'client' | 'boatman'>
export type DatesBusy = {[name:string]: DateBusy[]}
export interface GetBusyDatesResponse{
  dates: DatesBusy
  counters:ICounters;
  paginate: PaginateResponse;
}
export interface IFreteWithImages {
  id: string,
  prices: any,
  deposit_returned: Number | null,
  date: Date,
  postponed_new_id: String | null,
  postponed_old_id: String | null,
  clientId: string,
  state: IState | null,
  createdAt: Date,
  updatedAt: Date,
  images: Frete_Image[],
}

export interface IFretesPerMonth {
  'Janeiro'?:[],
  'Fevereiro'?:[],
  'Marco'?:[],
  'Abril'?:[],
  'Maio'?:[],
  'Junho'?:[],
  'Julho'?:[],
  'Agosto'?:[],
  'Setembro'?:[],
  'Outubro'?:[],
  'Novembro'?:[],
  'Dezembro'?:[],
}
export interface ICounters {
  'Marcada'?: number,
  'Pedido de Agendamento'?: number,
  'Cancelada'?: number,
  'Adiada'?: number,
  'Confirmada'?: number,
  'FretesPerMonth': IFretesPerMonth,
  'FretesThisWeek':  string[],
}