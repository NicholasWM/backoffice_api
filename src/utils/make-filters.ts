import { SearchClientsDTO } from 'src/clients/dtos'
import { Between, MoreThan, LessThan } from 'typeorm'
import { SearchFreteDTO } from '../fretes/dtos'

export const getFiltersSearchFrete = (searchFreteDTO:SearchFreteDTO)=> {
  let filters:any = {}
  Object.keys(searchFreteDTO).map(key => {
    if(searchFreteDTO[key] && key !== 'page'){
      filters[key] = searchFreteDTO[key]
    }
  })
  if(Object.keys(filters).includes('initialDate')
  && Object.keys(filters).includes('finalDate')){
    filters['date'] = Between(filters?.initialDate, filters?.finalDate)
    delete filters['initialDate']
    delete filters['finalDate']
  }else{
    if(Object.keys(filters).includes('initialDate')){
      filters['date'] = MoreThan(filters?.initialDate)
      delete filters['initialDate']
    }
    if(Object.keys(filters).includes('finalDate')){
      filters['date'] = LessThan(filters?.finalDate)
      delete filters['finalDate']
    }
  }
  return filters
}

export const getFiltersSearchClient = (searchClientsDTO:SearchClientsDTO)=> {
  let filters:any = {}
  Object.keys(searchClientsDTO).map(key => {
    if(searchClientsDTO[key] && key !== 'page'){
      filters[key] = searchClientsDTO[key]
    }
  })
  return filters
}