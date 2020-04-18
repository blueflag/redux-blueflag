---
id: Message
title: Message
group: React Enty
---

A Message bundles up all of the information surrounding a request and response from the api.
It holds all the information that you would need to both make requests and render their responses
when they come back. _Most often you shouldn't need to worry about creating messages. They are constructed for you
by the RequestHock._

_Tip: Messages only change when Enty does so are safe to compare with ===. This is great for render
performance._



```js
class Message<RequestState> {
    response: mixed;
    requestState: RequestState;
    requestError: mixed;
    request(payload: mixed) => Promise<mixed>;
    get(key: string, notFoundValue?: mixed) => mixed;
    getIn(keyPath: Array<string>, notFoundValue?: mixed) => mixed;
    updateRequestState(updater: RequestState => RequestState) => Message;
    toEmpty(): Message<Empty>;
    toFetching(): Message<Fetching>;
    toRefetching(response: mixed): Message<Refetching>;
    toSuccess(response: mixed): Message<Success>;
    toError(requestError: mixed): Message<Error>;
}
```

## Properties

### .response
**type:** `mixed`  

Once a request has returned the data can be found in response. _Note: you can also use
[get()](#get) and [getIn()](#getin) for easy access to the response object._

### .requestState
**type:** [RequestState]

Holds a variant that represents the current state of the request. By using a variant
Enty lets you declaratively represent how your component should render under each state of the 
request. _See [RequestState] for more details on variants._

```jsx
function UserAvatar(props) {
    const {userMessage} = props;
    return userMessage.requestState
        .fetchingMap(() => <Loader/>)
        .refetchingMap(() => <Loader/>)
        .successMap(() => <img src={userMessage.get('avatar')} />)
        .errorMap(() => <span>user not found :(</span>)
        .value;
}
```

### .requestError
**type:** `mixed`  

If the request promise rejects Enty will rerender the view with the caught error in 
`requestError`. _The requestState will also be in an error state._

```jsx
function UserAvatar(props) {
    const {userMessage} = props;
    return userMessage.requestState
        .successMap(() => <img src={userMessage.get('avatar')} />)
        .errorMap(() => <span>{userMessage.requestError.message}</span>)
        .value;
}
```


## Methods

### .request()
**type:** `(payload) => Promise<mixed>`  

A promise returning function that will dispatch the corresponding api function. _This is most often 
used to trigger user initiated requests like save or remove._

_Note: The payload given to onRquest is not passed through `config.payloadCreator`_

```jsx
function Button({message}) {
    return <button onClick={() => message.request()}>Save</button>;
}

const SaveUserButton = SaveUserHoc({name: 'message'})(Button);
```


### .get()
**type:** `(key: string, notFoundValue?: mixed) => mixed`  

Returns the value from `message.response.${key}`. If nothing is found it will return `defaultValue`
if provided.

```js
const score = message.get('score', 0);
```

### .getIn()
**type:** `(keyPath: Array<string>, notFoundValue?: mixed) => mixed`  

Returns the value at the provided key pathm or defaultValue if nothing is found.

```js
const name = message.getIn(['user', 'name'], '-');
```


### .toEmpty()
**type:** `() => Message<Empty>;`

Cast the current message to a new Message with an empty requestState.


### .toFetching()
**type:** `() => Message<Fetching>;`

Cast the current message to a new Message with a fetching requestState.


### .toRefetching()
**type:** `(response: mixed) => Message<Refetching>;`

Cast the current message to a new Message with a refetching requestState.


### .toSuccess()
**type:** `(response: mixed) => Message<Success>;`

Cast the current message to a new Message with a success requestState.


### .toError()
**type:** `(requestError: mixed) => Message<Error>;`

Cast the current message to a new Message with an error requestState.




## Static Unit Functions
Enty provides a series of helper functions to let you construct messages
in various request states. These are mostly used for providing default states.

### Message.empty()
**type:** `(MessageProps = {}) => Message<EmptyState>`

Create a Message in an Empty state.

### Message.fetching()
**type:** `(MessageProps = {}) => Message<FetchingState>`

Create a message in a Fetching state

### Message.refetching()
**type:** `(response: mixed, rest?: MessageProps = {}) => Message<RefetchingState>`

Create a message in a Refetching state

### Message.success()
**type:** `(response: mixed, rest?: MessageProps = {}) => Message<SuccessState>`

Create a message in a Success state


### Message.error()
**type:** `(requestError: mixed, rest?: MessageProps = {}) => Message<ErrorState>`

Create a message in an Error state.


[RequestState]: ./RequestState
