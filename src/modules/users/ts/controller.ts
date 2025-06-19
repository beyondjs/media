import { PageReactWidgetController } from '@beyond-js/react-18-widgets/page';
import { StoreManager } from './store';
import { View } from './views/view';

export /*bundle*/ class Controller extends PageReactWidgetController {
  #store: StoreManager;
  createStore() {
    this.#store = new StoreManager();
    return this.#store;
  }
  get Widget() {
    return View;
  }
  show() {}
}
