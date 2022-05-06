import { Frete_Image } from "src/images/frete-images.entity";
import {  PaginateResponse } from "src/utils/pagination";
import { Frete } from "../fretes.entity";
import { IState } from "../types";

export type DateBusy = Pick<Frete, 'date'| 'id' | 'state' | 'client' | 'boatman'>
export type DatesBusy = {[name:string]: DateBusy[]}
export interface GetBusyDatesResponse{
  dates: DatesBusy
  counters:ICountersBusyDates;
  paginate: PaginateResponse;
}
export interface ClientDatesFreteResponse{
  dates: DatesBusy
  counters:ICountersClientDates;
  paginate: PaginateResponse;
}
export interface IFreteWithImages {
  id: string,
  prices: any,
  deposit_returned: number | null,
  date: Date,
  postponed_new_id: string | null,
  postponed_old_id: string | null,
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
export interface ICountersClientDates {
  'Marcada'?: number,
  'Pedido de Agendamento'?: number,
  'Cancelada'?: number,
  'Adiada'?: number,
  'Confirmada'?: number,
  'FretesPerMonth': IFretesPerMonth,
  'FretesThisWeek':  string[],
}
export interface ICountersBusyDates {
  'Marcada'?: number,
  'Pedido de Agendamento'?: number,
  'Cancelada'?: number,
  'Adiada'?: number,
  'Confirmada'?: number,
  'FretesPerMonth': IFretesPerMonth,
  'FretesThisWeek':  string[],
}

export const months = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export interface GetAvailableDatesResponse {
  'Domingo': string[];
  'Segunda': string[];
  'Terça': string[];
  'Quarta': string[];
  'Quinta': string[];
  'Sexta': string[];
  'Sabado': string[];
}
export interface IGetSchedulingRequests{
  pageSelected?:number,
  numberOfResults?:number,
}
export interface IGetSchedulingRequestsResponse{
  paginate: PaginateResponse;
  fretes: Frete[]
}