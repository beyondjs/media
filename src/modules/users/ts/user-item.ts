import { Item } from '@beyond-js/reactive/entities/item';

export interface IUserItem {
  user: string;
  name: string;
  dni: string;
}

export /*bundle*/ class UserItem extends Item<IUserItem> {
  constructor(identifier: string) {
    super({ id: identifier });
  }
  // Métodos y propiedades adicionales del usuario
}
