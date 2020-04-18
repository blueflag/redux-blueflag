---
title: Getting Started
group: Tutorials
---

## Installation

```
yarn add react-enty
```
_Note: the `enty` package only contains the schemas. `react-enty` contains the api, which lets you 
use those schemas in a react project. React Enty depends on Enty, so you only need to add react 
enty to your project._

## Setup

When using Enty in a project there are two parts: The schema and the API.

### 1. Schema
The first step in implementing Enty is to create your schema. This defines the relationships between
your entities.  In this example we'll say a user has a list of friends which are also users. 

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

### 2. API
The second thing we need to do is to create an api from our schema. This will let us fetch some data.
The EntityApi takes a bunch of promise returning functions and turns them into hocs that fetch, normalize and then provide data to our application. 

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

### 3. Connect to react
Currently Enty uses redux to store it's data. The api we recently created exports a store that
we can dump into a redux provider. 

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


### 4. Make a Request
Now we can use one of the request hocs exported from our api to request data.

```jsx
// UserAvatar.js
import React, {useEffect} from 'react';
import Api from './Api';
import Spinner from './Spinner';
import Error from './Error';

export default function UserAvatar(props) {
    const {id} = props;
    const userMessage = Api.user.get.useRequest();

    useEffect(() => {
        userMessage.request({id})
    }, [id]);

    return <LoadingBoundary fallback={Spinner} error={Error}>
        {({user}) => <img src={user.avatar} />}
    </LoadingBoundary>;
}


```

Read more: [RequestHoc], [Message], [RequestState]

[Schemas]: /docs/schemas/entity-schema
[Api]: /docs/api
[RequestHoc]: /docs/data/RequestHoc
[Message]: /docs/data/Message
[RequestState]: /docs/data/RequestState

