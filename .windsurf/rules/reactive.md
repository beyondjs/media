---
trigger: model_decision
description: When we will create a ReactiveModel, Model alone, Item or Collection
---

# modules/models/.windsurfrules
1. Every reactive domain artifact must extend `ReactiveModel`.
2. Three archetypes exist:
   a. Item: represents a single entity (e.g. User).
   b. Collection: array-like container of Items.
   c. Model: aggregate root that may embed Items or Collections.
3. Provide an `I<name>` interface listing **all** public fields.
4. Interface properties must be re-declared inside the class with `declare`:
       interface IUser { id: string; name: string }
       export /*bundle*/ class User extends ReactiveModel implements IUser {
         declare id: string;
         declare name: string;
         constructor(props: IUser) {
           super({ properties: ['id', 'name'] });
           Object.assign(this, props);
         }
       }
5. Pass `{ properties: string[] }` as the first argument to `super` with the exact list of property names in declaration order.
6. Put factory helpers in the same file:
       export const createUser = (p: IUser) => new User(p);
7. Collections expose `.add(item)`, `.remove(id)` and `.find(id)`; they store items by primary key.
8. Models must expose a static `fromJSON()` and an instance `.toJSON()` round-trip pair.
9. Avoid side effects in constructors; async work goes into an `async init()` method.
10. All Items, Collections and Models live under `modules/models/<entity>/` in their own file, snake-case named after the entity (e.g. `user.ts`).
