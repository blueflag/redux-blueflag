---
title: Getting Started
group: Tutorials
---

## Installation

```
yarn add react-enty
```
_Note: the `enty` package only contains the schemas. `react-enty` contains both the schemas and
the bindings to react._


## 1. Schema
The first step in implementing Enty is to create your schema. This defines the relationships between
your entities. In this example we'll say a user has a list of friends which are also users. 

```js
// ApplicationSchema.js
import {ObjectSchema} from 'react-enty';
import {ArraySchema} from 'react-enty';
import {EntitySchema} from 'react-enty';

var user = new EntitySchema('user');
var userList = new ArraySchema(user);

user.shape = new ObjectSchema({
    friendList: userList
});

export default new ObjectSchema({
   user,
   userList
});

```
Read more: [Schemas]

## 2. API
The second thing we need to do is to create an api from our schema. This will let us fetch some data.
The EntityApi takes a group of promise returning functions and turns them into hooks that fetch, normalize and then provide data to our application. 

```jsx
// Api.js
import {EntityApi} from 'react-enty';
import ApplicationSchema from './ApplicationSchema';

export default EntityApi({
    user: {
        get: variables => request('/graphql', {query: UserQuery, variables}),
        list: variables => request('/graphql', {query: UserListQuery, variables})
    }
}, ApplicationSchema);

```
Read more: [Api]

## 3. Connect to react
To allow the hooks to access state we need to wrap our app in the provider exported from the api.

```jsx
// index.js
import {React} from 'react';
import ReactDOM from 'react-dom';
import Api from './Api';


ReactDOM.render(
    <Api.EntityProvider>
        <App />
    </Api.EntityProvider>,
    document.getElementById('app'),
);

```


## 4. Make a Request
Now we can use one of the request hooks exported from our API to request data.
The `useEffect` hook returns a message that contains all the required information to fetch and represent our requested data.

* It has an `onRequest` function that we can call on mount, or if a prop changes, or give to a button as a callback.
* It has a `requestState` that we can give to a loading boundary to render a fallback while it is fetching.
* It has a `response` that will contain the data once it has returned.

```jsx
// UserAvatar.js
import React, {useEffect} from 'react';
import Api from './Api';
import Spinner from './Spinner';
import Error from './Error';

export default function UserAvatar(props) {
    const {id} = props;

    // Create the message from the hook
    const userMessage = Api.user.get.useRequest();

    // Call the onRequest function if the id changes
    useEffect(() => {
        userMessage.onRequest({id});
    }, [id]);


    // Wrap the message in a loading boundary render a fallback while the data is fetching
    return <LoadingBoundary message={userMessage} fallback={Spinner} error={Error}>
        {({user}) => <img src={user.avatar} />}
    </LoadingBoundary>;
}


```

Read more: [RequestHook], [Message], [RequestState]

