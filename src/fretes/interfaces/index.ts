import { Frete_Image } from "src/images/frete-images.entity";
import { IState } from "../types";

export interface IFreteWithImages {
  id: string,
  email:string,
  price: Number,
  deposit_returned: Number | null,
  date: Date,
  postponed_frete: Date | null,
  clientId: string,
  state: IState | null,
  createdAt: Date,
  updatedAt: Date,
  fretes: Frete_Image[],
}