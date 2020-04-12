# Enty 
[![enty npm](https://img.shields.io/npm/v/enty.svg?style=flat-square)](https://www.npmjs.com/package/enty)
[![enty circle](https://img.shields.io/circleci/project/github/blueflag/enty.svg?style=flat-square)](https://circleci.com/gh/blueflag/enty)

## Introduction
Enty is a framework for managing data requested from back-ends and APIs.  Instead of you manually storing requested data, Enty uses schemas to describe relationships and stores the data as normalized entities.

* Views can declare what data they need.
* There is practically no data fetching code.
* Data given to views is always up to date.
* Bad relationships in data become clear.
* pairs wonderfully with graphql


## Purpose

<!-- ## models -->
Any webapp that involves  both a back and a front end will create entities. Unique pieces of data that are known by an id.  The back end might call them models, the front end might call them application state, let's call them entities.

<!-- ## too much handling of the data -->
When the client side thinks of storing these entities in terms of endpoints and stores (or even actions and reducers) it's another set of hands touching the data. It allows more places for shady hacks to creep in. It allows more places for code to become brittle. It allows more places for the code to break.

On top of this you force the front end to recreate relationships between entities. Storing data by type in isolated stores logically makes sense, but when a view visually combines two entities (post with comments) you create a point where the front end needs to know exactly how to reconstruct this. This is not an insurmountable problem but as the code base grows so will the places where the front end has to know some specific detail and the places where things can go wrong.

<!-- ## front end concerns.  -->
In reality the front end doesn't care where the data came from or how it is stored. It just knows that it wants a certain number of entities and information about whether they have arrived yet.

<!-- ## Enty -->
Enty lets you describe the relationships of your entities through schemas. It is then able to store them in a normalized state. This means that they are not stored by request but by the unique id that they were given by the back-end.



## Getting Started

Enty has two parts: A Schema and an EntityApi.

### 1. Schema
The first step in implementing Enty is to define your schema. This defines what relationships your entities have. A user might have a list of friends which are also users. So we can define that as a user

```js
// entity/ApplicationSchema.js
import {
    MapSchema,
    ListSchema,
    EntitySchema,
} from 'enty';

var user = new EntitySchema('user');
var userList = ListSchema(user);

user.set(MapSchema({
    friendList: userList
}))

export default MapSchema({
   user,
   userList
});

```

### 2. API
The second thing we need to do is to create our EntityApi from our schema;

```js
// entity/EntityApi.js
import {EntityApi} from 'enty';
import ApplicationSchema from './ApplicationSchema';

const Api = EntityApi(ApplicationSchema, {
    core: payload => request('/graphql', payload)
});

export const {
    EntityStore,
    CoreQueryHock,
    CoreMutationHock,
} = Api;

```

### 3. Connect to react

```jsx
// client.jsx
import {React} from 'react';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';
import {EntityStore} from './entity/EntityApi';


ReactDOM.render(
    <Provider store={EntityStore}>
        <App />
    </Provider>,
    document.getElementById('app'),
);

```

### 4. Make a Query

```jsx
// component/User.jsx
import {React} from 'react';
import {CoreQueryHock} from '../entity/EntityApi';

function User(props) {
    const {user} = props;
    return <img src={user.get('avatar')} />;
}

const withData = CoreQueryHock(props => {
    return {
        query: UserDataQuery,
        variables: {
            id: props.id
        }
    };
}, ['id']);

export default withData(User);

```


## Entity Flow

1. **Props Change / OnMutate Triggered**  
The Enty data flow begins when either a QueryHocked components props change or a MutationHocked component fires its onMutate callback. When this happens the corresponding promise creator in the API is fired. 

2. **Data Request / Receive**  
The data request actions is triggered and the corresponding queryRequestState becomes a FetchingState. If the promise rejects the Error action is triggered, the message becomes an error and the flow finishes. 
If the promise resolves the receive action is triggered, the message becomes a SuccessState. 

3. **Normalize**    
The payload is passed into schema.normalize, which will in turn call schema.normalize recursively on its children as defined. Entities are stored under their schema type key and the result of their id attribute. Each entity is also passed through their constructor function which is given the current entity and the previous version if it exists. 

4. **Results & Entities Stored**  
The normalised entities are shallow merged with the previous state. The normalised result object is stored under its responseKey.

5. **Views Updated**  
The update in state triggers a rerender. All hocked views select their data based on their result key. 
Schema.denormalize is given the new entity state and the normalised result object that matches their result key. As the result object is traversed denormalizeFilter is called on each entity. Any that fail the test will not be returned. 


## Entity Types


## FAQ

### What if I am using two Query/Mutation hocks
Use the options override!

```js
const withQuery = CoreQueryHock(
    props => ({
        query: UserQuery, 
        variables: {
            id: props.id
        }
    }),
    {
        queryRequestStateProp: 'userRequestState'
    }
);
```


### How do I load things?

### Why is react-redux a peer dependency (it's not yet... but it should be)

### How do I handle endpoints that return arrays?
We have found the cleanest way is to add a new service to your api and modify the data before it is given to Enty

```js
// EntityApi.js
const Api = EntityApi(ApplicationSchema, {
    core: payload => request('/graphql', payload),
    userList: payload => request('/user', payload).then(data => ({userList: data}))
});
```

### Do I have to export an MapSchema from my EntityApi?


