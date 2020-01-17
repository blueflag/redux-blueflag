# Request States & Fallbacks
Becuase the request state is a concrete data type, rather than just a series of booleans, it 
is very easy to abstract common loading situations away behind a function or a hoc.

## ApplyLoader

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
        .value();
}
```

## Merging RequestStates

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
    .value();
```

## Any Success

@TODO
