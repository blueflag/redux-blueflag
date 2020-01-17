---
title: Data Fetching Triggers
---

### Fetch On Load

```jsx
import {useEffect} from 'react';
import api from './api';
import Spinner from ./components/Spinner';
import Error from ./components/Error';

export default function Avatar(props) {
    const message = api.user.useRequest();
    useEffect(() => {
        message.onRequest({id: props.id});
    }, []);

    return <LoadingBoundary message={message} fallback={<Spinner/>} error={<Error />}>
        {({user}) => <img src={user.avatar} alt={user.name} />}
    </LoadingBoundary>
}
```

### Fetch On Prop Change
```jsx
import {useEffect} from 'react';
import api from './api';
import Spinner from ./components/Spinner';
import Error from ./components/Error';

export default function Avatar(props) {
    const message = api.user.useRequest();
    useEffect(() => {
        message.onRequest({id: props.id});
    }, [props.id]);

    return <LoadingBoundary message={message} fallback={<Spinner/>} error={<Error />}>
        {({user}) => <img src={user.avatar} alt={user.name} />}
    </LoadingBoundary>
}
```

### Fetch On Callback
```jsx
import {useState} from 'react';
import api from './api';
import Spinner from ./components/Spinner';
import Error from ./components/Error';

export default function Avatar(props) {
    const [id, setId] = useState();
    const message = api.user.useRequest();

    return <Box>
        <input value={id} onChange={(e) => setId(e.value)} />
        <button onClick={() => message.onRequest({id})}>Fetch User</button>
        <LoadingBoundary message={message} fallback={<Spinner/>} error={<Error />}>
            {({user}) => <img src={user.avatar} alt={user.name} />}
        </LoadingBoundary>
    </Box>
}
```

### Fetch Series

```jsx
import {useEffect} from 'react';
import api from './api';
import Spinner from ./components/Spinner';
import Error from ./components/Error';

export default function Avatar(props) {
    const foo = api.user.useRequest();
    const bar = api.user.useRequest();
    const loadingProps = {fallback: <Spinner />, error: <Error />};
    const renderUser = {({user}) => <img src={user.avatar} alt={user.name} />}
    
    useEffect(() => {
        foo.onRequest('foo')
            .then(() => bar.onRequest('bar'));
    }, []);

    return <Box>
        <LoadingBoundary message={foo} {...loadingProps} />{renderUser}</LoadingBoundary>
        <LoadingBoundary message={bar} {...loadingProps} />{renderUser}</LoadingBoundary>
    </Box>
}

```

### Fetch Parallel

```jsx
import {useEffect} from 'react';
import api from './api';
import Spinner from ./components/Spinner';
import Error from ./components/Error';

export default function Avatar(props) {
    const foo = api.user.useRequest();
    const bar = api.user.useRequest();
    const loadingProps = {fallback: <Spinner />, error: <Error />};
    const renderUser = {({user}) => <img src={user.avatar} alt={user.name} />}
    
    useEffect(() => {
        foo.onRequest('foo');
        bar.onRequest('bar');
    }, []);

    return <Box>
        <LoadingBoundary message={foo} {...loadingProps} />{renderUser}</LoadingBoundary>
        <LoadingBoundary message={bar} {...loadingProps} />{renderUser}</LoadingBoundary>
    </Box>
}
```
