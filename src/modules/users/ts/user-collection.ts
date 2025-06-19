import { Collection } from '@beyond-js/reactive/entities/collection';
import { UserItem, IUserItem } from './user-item';

export /*bundle*/ class UserCollection extends Collection<UserItem, IUserItem> {
  constructor() {
    super({ Item: UserItem });
  }
  // Lógica personalizada para la colección de usuarios
}
