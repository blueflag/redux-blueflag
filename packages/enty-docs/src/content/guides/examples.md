---
id: examples
title: Examples
group: Tutorials
---

## Request on Load
The most common use case for Enty is to request data for a view whenever it loads. 
Below we import a component called `UserItemStructure` that needs user data.
We can use a compose function to apply the `UserItemRequest` hoc.
Auto is set to respond to updates from `props.id`.
Payload creator will take `props.id` and pass it to the API.

```
// UserItemView.js
import UserItemStructure from '../structure/UserItemStructure';
import {UserItemRequest} from './EntityApi';

export default composeWith(
    UserItemRequest({
        auto: ['id'],
        payloadCreator: (props) => ({id: props.id})
    }),
    UserItemStructure
);
```

## Callbacks
Some times a view will require a request to respond user interaction. In this case we can not set
the auto config and pass our message's `request` function to a handler.

```
function Form(props) {
    const {formMessage} = this.props;
    const {formState} = this.props;
    return <div>
        ...The rest of the form...
        <button onClick={() => saveMessage.request(formState)}>Save</button>
    </div>;
}

const FormView = composeWith(
    FormSaveRequest({
        name: 'formMessage'
    }),
    Form
);

```
## Loading Hoc
Having a standard data structure for the request state makes it super easy to abstract away what
your application should render while it is fetching data. A simple hoc can make sure your components
only render once the request has returned with data.

```jsx
// LoadingHoc.jsx
export default (config) => (Component) => (props) => {
    const message = this.props[config.message];
    return message
        .fetchingMap(() => <Spinner />)
        .refetchingMap(() => <Spinner />)
        .errorMap(() => <ErrorHandler error={message.requestError}/>)
        .successMap(() => <Component {...props} />)
        .value;
}
```

You can even get more complicated and accept a list of messages to check against

```
// LoadingHoc.jsx
export default (config) => (Component) => (props) => {
    return [].concat(config.message) // cast strings to an array
        .reduce((previous, next) => {
            // Select our messages
            const previousMessage = this.props[previous];
            const nextMessage = this.props[next];
            return previousMessage.requestState
                // Apply the error
                .errorMap(() => <ErrorHandler error={previousMessage.requestError}/>)
                // Flatten the next message onto our chain
                .successFlatMap(() => nextMessage))
        .fetchingMap(() => <Spinner />)
        .refetchingMap(() => <Spinner />)
        .successMap(() => <Component {...props} />)
        .value;
}
```

## Parallel Requests
Automatic request hocs are by their nature parallel. All we need to do is stack up a few request
hocs and then use some helper functions to calculate our request state

```js
const UserAndPetView = composeWith(
    UserRequest({
        name: 'userMessage',
        auto: ['userId']
    }),
    PetRequest({
        name: 'petMessage',
        auto: ['petId']
    }),
    LoadingHoc({
        message: ['userMessage', 'petMessage'],
    })
    UserAndPetStructure
);
```

## Sequential Requests


## Caching

## Streaming Requests

## Take Last Request

## Hoc Chaining

## Composite Entities

## Normalizing To Filter

