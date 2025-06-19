import React from 'react';
import type { StoreManager, IUser } from '../store';

interface IModuleContext {
  texts?: Record<string, any>;
  store?: StoreManager;
  items: IUser[];
}

export const ModuleContext = React.createContext<IModuleContext>({} as IModuleContext);
export const useModuleContext = () => React.useContext(ModuleContext);
