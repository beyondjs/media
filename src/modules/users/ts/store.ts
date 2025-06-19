import { IWidgetStore } from '@beyond-js/widgets/controller';

export /*bundle*/ class StoreManager implements IWidgetStore {
  users: IUser[] = [];
}

export interface IUser {
  user: string;
  name: string;
  dni: string;
}
