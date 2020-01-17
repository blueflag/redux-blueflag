---
id: EntityApi
title: Entity Api
group: React Enty
---

The EntityApi provides a declarative way to turn a series of promise returning functions into hoc's
that fetch your data.

```js
EntityApi(
    actionMap: {[key: string]: () => Promise<*>},
    schema?: Schema,
);
```

## Params

### actionMap
**type:** `{[key: string]: () => Promise<*>} `  
**returns:** `{[key: string]: {useRequest: RequestHook, entityProvider}}`

Action map is an aribtarily nested set of promise returning functions. Enty wraps these
functions into a [RequestHook] bound to the schema provided.

```js
const Api = EntityApi({
    currentUser: (payload) => get('/currentUser', payload)
    course: {
        get: (payload) => get('/user', payload),
        create: (payload) => post('/user', payload)
    }
}, ApplicationSchema);

export const useCurrentUser = Api.currentUser.useRequest;
export const useCourseGet = Api.course.get.useRequest;
export const useCourseCreate = Api.course.create.useRequest;

export const Provider = Api.Provider;
```

### schema
**type:** `StructuralSchema`

When data is returned from an api function Enty will use this schema to start the normalizing 
process. This schema functions similarly to the [graphql] root resolver and works like a small
namespace for your specific schemas. 

* _There is no required type of schema, but in most cases an 
ObjectSchema makes the most sense._

* _Schema is optional. If you dont provide a schema all your request state will still be tracked but nothing will be normalized._


```js
const user = new EntitySchema('user');
const course = new EntitySchema('course');
const course = new EntitySchema('course');
const rootSchema = new ObjectSchema({
    user,
    course,
    location
});

EntityApi(rootSchema, actionMap);
```

## Returns
EntityApi traverses the provided object map and wraps each promise function in RequestHook and a RequestHoc.This lets you group portions of your api as it make sense to.

```js
const api = EntityApi({
    course: {
        get: (payload) => get('/course', payload),
        create: (payload) => post('/course', payload),
        save: (payload) => post(`/course/${payload.id}`, payload)
    },
    user: {
        get: (payload) => get('/course', payload),
        create: (payload) => post('/course', payload),
        save: (payload) => post(`/course/${payload.id}`, payload)
    }
});

export const getUserHook = api.user.get.useRequest;
export const createCourseHoc = api.course.create.requestHoc;
```

### useRequest
See [RequestHook](/api/react-enty/request-hook)

### RequestHoc
See [RequestHoc](/api/react-enty/request-hoc)

## Root Returns
EntityApi also returns a few global tools at the root level that are necessary for your application.


### Provider
The Provider links lets Request Hooks connect to the Enty store via context. It must be rendered above any component that uses a Request hook or hoc.

```jsx
import Api from './EntityApi';
import ThemeProvider from './ThemeProvider';

export default function MainView() {
    return <Api.Provider>
        <ThemeProvider>
            <AppComponent/>
        </ThemeProvider>
    </Api.Provider>;
}
```

### ProviderHoc
The ProviderHoc wraps the Provider in a hoc. This is useful if your 

```jsx
import Api from './EntityApi';
import ThemeProviderHoc from './ThemeProviderHoc';
import composeWith from 'unmutable/composeWith';

export default composeWith(
    Api.ProviderHoc(),
    ThemeProviderHoc(),
    AppComponent
);
```

### useRemove
Returns a side-effect that will remove an entity from the store.

```jsx
// RemoveUser.jsx
import api from './EntityApi';

export default function RemoveUser(props) {
    const remove = api.useRemove();
    return <button onClick={() => remove('user', props.id)}>Remove User</button>;
}
```

### RemoveHoc
Hocs a component with a `useRemove` hook and provides the side-effect to `config.name`

```jsx
// RemoveUser.jsx
import api from './EntityApi';

function RemoveUser({onRemove, id}) {
    return <button onClick={() => onRemove('user', id)}>Remove User</button>;
}

export default api.RemoveHoc({name: 'onRemove'})(RemoveUser);
```





