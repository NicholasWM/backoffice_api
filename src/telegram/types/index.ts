import { TelegramClient } from "src/telegram-client/entities/telegram-client.entity";
import { TelegramUser } from "src/telegram-user/entities/telegram-user.entity";

export interface IGetAllTelegrams {
  clients: TelegramClient[], 
  users: TelegramUser[]
}

export interface IConnectToInstance {
  instanceId: string,
  data: {
    first_name?: string,
    telegram_id: number,
    is_bot: boolean,
    language_code?: string,
    last_name?: string,
    username?: string
  }
}
export type ParseVCardResponse = {
  "version": "2.1",
  "fn": "1",
  "tel": {
    "meta": {
      "TYPE": string
    },
    "value": string[]
  }[]
}

export function parseVCard(input): ParseVCardResponse {
  const Re1 = /^(version|fn|title|org):(.+)$/i;
  const Re2 = /^([^:;]+);([^:]+):(.+)$/;
  const ReKey = /item\d{1,2}\./;
  const fields = {} as ParseVCardResponse;

  input?.split(/\r\n|\r|\n/).forEach(function (line) {
    let results, key;

    if (Re1.test(line)) {
      results = line.match(Re1);
      key = results[1].toLowerCase();
      fields[key] = results[2];
    } else if (Re2.test(line)) {
      results = line.match(Re2);
      key = results[1].replace(ReKey, '').toLowerCase();

      const meta = {};
      results[2]?.split(';')
        .map(function (p, i) {
          const match = p.match(/([a-z]+)=(.*)/i);
          if (match) {
            return [match[1], match[2]];
          } else {
            return ["TYPE" + (i === 0 ? "" : i), p];
          }
        })
        .forEach(function (p) {
          meta[p[0]] = p[1];
        });

      if (!fields[key]) fields[key] = [];

      fields[key].push({
        meta: meta,
        value: results[3]?.split(' ')?.join('')?.split('-')?.join('')?.split(';')
      })
    }
  });

  return fields;
};
