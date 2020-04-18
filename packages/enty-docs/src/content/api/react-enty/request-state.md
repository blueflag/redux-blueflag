---
title: Request State
group: React Enty
---

There are five distinct states to any data fetching request:

| State      | Data                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Empty      | Nothing has been requested                                            |
| Fetching   | Request is in process for the first time                              |
| Refetching | Request has already returned data but is in process for a second time | 
| Success    | Request has completed and returned requested data                     | 
| Error      | Request has failed and returned an error                              |



RequestState is a variant that allows the user to render the different states of a request in a declarative manner. It's api gives you a clear way of handling each possible state and makes sure your app is never rendering an unpredicted state.


```js
class RequestState {

    // Map
    emptyMap(mapper: RequestStateMapper) => RequestState
    fetchingMap(mapper: RequestStateMapper) => RequestState
    refetchingMap(mapper: RequestStateMapper) => RequestState
    successMap(mapper: RequestStateMapper) => RequestState
    errorMap(mapper: RequestStateMapper) => RequestState
        
    // FlatMap
    emptyFlatMap(mapper: RequestStateFlatMapper) => RequestState
    fetchingFlatMap(mapper: RequestStateFlatMapper) => RequestState
    refetchingFlatMap(mapper: RequestStateFlatMapper) => RequestState
    successFlatMap(mapper: RequestStateFlatMapper) => RequestState
    errorFlatMap(mapper: RequestStateFlatMapper) => RequestState

    // Casting
    toEmpty() => RequestState
    toFetching() => RequestState
    toRefetching() => RequestState
    toSuccess() => RequestState
    toError() => RequestState

    // States
    isEmpty: boolean;
    isFetching: boolean;
    isRefetching: boolean;
    isSuccess: boolean;
    isError: boolean;

    value(defaultValue: *) => *
}
```

## Properties

### .is{State}


State properties hold the raw booleans to describe the request state. 

_They are easy to access but map functions or [LoadingBoundary] make your code more predictable._

```
isEmpty: boolean;
isFetching: boolean;
isRefetching: boolean;
isSuccess: boolean;
isError: boolean;
```

```jsx
function User({message}) {
    if(message.isFetching) {
        return <Spinner />;
    }
    return <img src={message.resonse.user.avatar} />
}

```


## Methods
RequestState seems to have a lot of methods but in reality it is three methods duplicated for each
of the five possible states of a request:  Empty, Fetching, Refetching, Success & Error.

### .{state}Map()
**type:** `(mapper: A => B) => RequestState`  

Map functions will call their mapper with the current value of the variant and update it with the 
result. The useful part is that they will only call the functions that match the current state of
the variant. This means you can describe what should happen for all states of the request but 
only action on the current state.


```jsx
function User({message}) {
    return message.requestState
        .emptyMap(() => null)
        .fetchingMap(() => <Spinner />)
        .refetchingMap(() => <img src={mesage.get('avatar')} />)
        .successMap(() => <img src={mesage.get('avatar')} />)
        .errorMap(() => <Error error={message.requestError} />)
        .value;
}
```


### .{state}FlatMap()
**type:** `(mapper: (A) => RequestState<B>) => RequestState<B>`  

FlatMap is similar to Map except instead of your mapper returning a value that is stored inside the
current request state, your mapper returns a new RequestState. _This is useful if you want to 
replace the state from a different source._

```jsx
function validateData(data) {
    if(data.hasErrors) {
        return RequestState.error();
    }
    return RequestState.success();
}

return requestState
    .successFlatMap(() => validateData(message.response))
    .errorMap(() => 'Error!')
    .successMap(() => 'Success.')
    .value;
```
With the above example we can wait until the response is a success until we validate a portion of
the data. But we can still maintain single purpose functions for how to render the data and how to
respond to an error.


### .to{state}()
**type:** `() => RequestState`

Casts a request state to a different type.

```jsx
RequestState.fetching('foo')
    .toError()
    .fetchingMap(() => 'bar')
    .value; // foo
```


### .value
**type:** `() => *`   

Returns either the current state of the variant.


### Unit Functions
The request state class has static unit functions for creating requestStates in different forms.

```js
import {RequestState} from 'react-enty';

RequestState.empty();
RequestState.fetching();
RequestState.refetching();
RequestState.success();
RequestState.error();
```

## Examples
Becuase the request state is a concrete data type, rather than just a series of booleans, it 
is very easy to abstract common loading situations away behind a function or a hoc.

### ApplyLoader

Writing all cases of a variant can become time consuming so we can abstract a common loading style 
into an applyLoader function.

```jsx
function applyLoader(message) {
    const {requestError} = message;
    const {response} = message;
    const {requestState} = message;

    return message.requestState
        .fetchingMap(() => <Loader/>)
        .refetchingMap(() => <Loader/>)
        .errorMap(() => <Error error={requestError}/>)
}

function User({userMessage}) {
    return applyLoader(userMessage)
        .successMap(() => <img src={userMessage.get('avatar')} />)
        .value;
}
```

### Merging RequestStates

You can even use a reduce to combine multiple request states together.
At each iteration if the previous requestState is a success it will replace it with the next.
This means that all must be true for the final state to render.
But if any are fetching or errored we will still get the right state.

```jsx
return this.props[config.messages]
    .reduce((previous, next) => previous.successFlatMap(() => next))
    .fetchingMap(() => <Loader/>)
    .refetchingMap(() => <Loader/>)
    .errorMap(() => <Error error={requestError}/>)
    .successMap(() => <Component {...this.props} />)
    .value;
```

### Any Success

@TODO
