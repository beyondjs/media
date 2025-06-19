---
trigger: manual
---


# ReactiveModel Rule: Modelo, Item, Colección y Provider

## 1. Crear un Modelo

Un modelo se define extendiendo la clase `Model` de `@beyond-js/reactive/model`. Este sirve como el núcleo lógico para manejar estados, eventos y relaciones entre entidades.

```ts
// file: my-model.ts
import { Model } from '@beyond-js/reactive/model';
export interface IMyModel {
}
export /*bundle*/ class MyModel extends Model<IMyModel> {
    constructor() {
        super();
    }

    // Agrega lógica personalizada aquí
}
````

## 2. Crear un Item

Un `Item` representa una entidad única e individual, como un usuario o un producto. Se extiende desde `Item` de `@beyond-js/reactive/entities/item`.

```ts
// file: my-item.ts
import { Item } from '@beyond-js/reactive/entities/item';

export /*bundle*/ class MyItem extends Item {
    constructor(identifier: string) {
        super({ id: identifier });
    }

    // Define propiedades y métodos específicos del item
}
```

## 3. Crear una Colección

Una colección agrupa múltiples instancias de un `Item`. Se extiende desde `Collection` de `@beyond-js/reactive/entities/collection`.

```ts
// file: my-collection.ts
import { Collection } from '@beyond-js/reactive/entities/collection';
import { MyItem } from './my-item';
````markdown
# ReactiveModel Rule: Modelo, Item, Colección y Provider

## 1. Crear un Modelo

Un modelo se define extendiendo la clase `Model` de `@beyond-js/reactive/model`, usando una interfaz para definir su estructura interna. El tipo genérico asegura el tipado del estado expuesto.

```ts
// file: my-model.ts
import { Model } from '@beyond-js/reactive/model';

export interface IMyModel {
    count: number;
}

export /*bundle*/ class MyModel extends Model<IMyModel> {
    constructor() {
        super();
    }

    // Agrega lógica personalizada aquí
}
````

## 2. Crear un Item

Un `Item` representa una entidad única. Se extiende desde `Item` e incluye su propia interfaz para tipar los datos. El genérico indica la forma de los datos gestionados por el item.

```ts
// file: my-item.ts
import { Item } from '@beyond-js/reactive/entities/item';

export interface IMyItem {
    id: string;
    name: string;
}

export /*bundle*/ class MyItem extends Item<IMyItem> {
    constructor(identifier: string) {
        super({ id: identifier });
    }

    // Métodos y propiedades del item
}
```

## 3. Crear una Colección

Una colección agrupa múltiples items. Se extiende desde `Collection` e implementa los genéricos que definen la estructura de los items.

```ts
// file: my-collection.ts
import { Collection } from '@beyond-js/reactive/entities/collection';
import { MyItem, IMyItem } from './my-item';

export /*bundle*/ class MyCollection extends Collection<MyItem, IMyItem> {
    constructor() {
        super({ Item: MyItem });
    }

    // Lógica personalizada para la colección
}
```

## 4. Crear un Provider

Un provider centraliza el acceso a instancias del modelo, item y colección, facilitando su uso reutilizable.

```ts
// file: my-provider.ts
import { MyModel } from './my-model';
import { MyItem } from './my-item';
import { MyCollection } from './my-collection';

export /*bundle*/ const myProvider = {
    model: new MyModel(),
    item: (id: string) => new MyItem(id),
    collection: new MyCollection()
};
```

```
```

export /*bundle*/ class MyCollection extends Collection {
    constructor() {
        super({ Item: MyItem });
    }

    // Personaliza la lógica de la colección si es necesario
}
```

## 4. Crear un Provider

Un provider encapsula y expone instancias del modelo, items o colecciones, permitiendo su reutilización en distintas partes de la aplicación.

```ts
// file: my-provider.ts
import { MyModel } from './my-model';
import { MyItem } from './my-item';
import { MyCollection } from './my-collection';

export /*bundle*/ const myProvider = {
    model: new MyModel(),
    item: (id: string) => new MyItem(id),
    collection: new MyCollection()
};
```

