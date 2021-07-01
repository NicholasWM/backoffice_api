import { Frete_Image } from "src/images/frete-images.entity";
import { IState } from "../types";

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
  'Cancelada'?: number,
  'Adiada'?: number,
  'Confirmada'?: number,
  'FretesPerMonth': IFretesPerMonth,
  'FretesThisWeek':  string[],
}