import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactRepository } from 'src/contacts/contacts.repository';
import { Contact } from 'src/contacts/entities/contact.entity';
import { getFiltersSearchClient } from 'src/utils';
import { In } from 'typeorm';
import { Client } from './clients.entity';
import { ClientRepository } from './clients.repository';
import { CreateClientDTO, FindClientByContactDTO, GetClientByIdDTO, SearchClientsDTO, UpdateClientDTO } from './dtos';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientRepository)
    private clientsRepository: ClientRepository,

    @InjectRepository(Contact)
    private contactsRepository: ContactRepository,
  ) { }
  async create(createClientDTO: CreateClientDTO): Promise<Client | false> {
    try {
      const contact = (await Promise.all(createClientDTO.contacts.map(contact => {
        return this.contactsRepository.findOne({
          where: {
            info: contact.info
          }
        })
      }))).find(item => item)

      if (!contact) {
        const client = await this.clientsRepository.createClient(createClientDTO)
        if (client) {
          const contacts = await Promise.all(createClientDTO.contacts.map(async contact => {
            return await this.contactsRepository.create({
              clientId: client.id,
              info: contact.info,
              status: true,
              description: contact.desc
            }).save()
          }))
          client.contacts = contacts
          return client
        }
      }

      return false
    } catch (error) {
      console.log(error)
    }
  }

  async getContactsByClientId(id: string) {
    const contacts = await this.contactsRepository.find({ where: { clientId: id } })
    return contacts
  }

  async findByContact(findClientByContactDTO: FindClientByContactDTO): Promise<Client | false> {
    const contact = (await Promise.all(findClientByContactDTO.contacts.map(contact => {
      return this.contactsRepository.findOne({
        where: {
          info: contact.info
        }
      })
    }))).find(item => item)

    if (!contact) {
      return false
    }
    const client = await this.clientsRepository.findOne({
      select: ['email', 'name', 'id'],
      where: {
        id: contact.clientId
      }
    })
    return client
  }

  async getWithFilters(searchClientsDTO: SearchClientsDTO): Promise<any> {
    const numberOfResults = 30
    const filters = getFiltersSearchClient(searchClientsDTO)
    const clients = await this.clientsRepository.find({
      order: { name: 'ASC' },
      where:
        filters,
      skip: searchClientsDTO?.page * numberOfResults || 0,
      take: numberOfResults
    })
    // const clients = await this.clientsRepository.find({take:50, skip:searchClientsDTO.page| 0});
    const contacts = await this.contactsRepository.find({ where: { clientId: In(clients.map(({ id }) => id)) } })
    return clients.map(client => ({ ...client, contacts: contacts.filter(contact => contact.clientId === client.id) }))
  }

  async getAll(): Promise<any> {
    const clients = await this.clientsRepository.find({ select: ['name', 'id'] })
    const contacts = await this.contactsRepository.find({ where: { clientId: In(clients.map(({ id }) => id)) }, select: ['description', 'info', 'status', 'clientId', 'id'] })
    return clients.map(client => ({ ...client, contacts: contacts.filter(contact => contact.clientId === client.id) }))
  }

  async getOne({ id }: GetClientByIdDTO): Promise<any> {
    const client = await this.clientsRepository.findOne(id)
    if (client) {
      const contacts = await this.contactsRepository.find({ where: { clientId: id } })
      return { ...client, contacts }
    }
    return false
  }

  async update(updateClientDTO: UpdateClientDTO): Promise<Client | false> {
    const client = await this.clientsRepository.findOne({ id: updateClientDTO.id })
    const keys = ['email', 'name']
    keys.forEach(key => {
      if (updateClientDTO[key]) {
        client[key] = updateClientDTO[key]
      }
    })
    try {
      await client.save()
      return client
    } catch (error) {
      console.log(error)
    }
    return false
  }
}
