---
trigger: manual
---

# widget-module

## Estructura general

```json
{
  "name": "name",
  "platforms": ["*"],
  "widget": {
    "is": "page",
    "route": "/example/${id}",
    "layout": "main-layout",
    "scss": {
      "path": "/scss",
      "files": ["*"]
    },
    "ts": {
      "path": "/ts",
      "files": ["*"]
    },
    "element": {
      "name": "example-widget-view"
    }
  }
}
````


## Reglas

* Los nombres de los modulos deben ir escritos en kebab-case.
* sino se especifica el nombre del widget, colocarle al name del element un nombre semantico que empiece con "app".
* `"is"` puede ser `"page"` o `"layout"`.
* Si `"is": "page"` es obligatorio `"route"`.
* Si se incluye `"scss"` debe existir `styles.scss` en `/scss`.

## Estructura de archivos (dentro de `/ts`)

```
/ts
├── controller.ts
├── store.ts
└── views/
    ├── context.tsx
    └── view.tsx
```

### controller.ts

```ts
import { PageReactWidgetController } from '@beyond-js/react-18-widgets/page';
import { StoreManager } from './store';
import { View } from './views';

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
```

### store.ts

```ts
import { IWidgetStore } from '@beyond-js/widgets/controller';
import { BaseStoreManager } from '@aimpact/ailearn-app/entities/assignments/activities/base';

export class StoreManager extends BaseStoreManager implements IWidgetStore {
  isStore?: boolean;
}
```

### views/context.tsx

```tsx
import React from 'react';
import type { StoreManager } from '../store';
import { Assignment } from '@aimpact/ailearn-sdk/tracking';

interface IModuleContext {
  texts?: Record<string, any>;
  store?: StoreManager;
  items: Assignment[];
}

export const ModuleContext = React.createContext<IModuleContext>({} as IModuleContext);
export const useModuleContext = () => React.useContext(ModuleContext);
```

### views/view\.tsx

```tsx
import React from 'react';

export const View = () => {
  return <div>My Widget View</div>;
};
```

