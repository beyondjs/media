import { UserModel } from './user-model';
import { UserItem } from './user-item';
import { UserCollection } from './user-collection';

export /*bundle*/ const userProvider = {
  model: new UserModel(),
  item: (id: string) => new UserItem(id),
  collection: new UserCollection()
};
