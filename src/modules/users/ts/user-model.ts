import { Model } from '@beyond-js/reactive/model';

export interface IUserModel {
  user: string;
  name: string;
  dni: string;
}

export /*bundle*/ class UserModel extends Model<IUserModel> {
  constructor() {
    super();
  }
  // Puedes agregar lógica personalizada aquí
}
