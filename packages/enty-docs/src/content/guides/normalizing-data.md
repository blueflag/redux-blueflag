---
title: Normalizing Data
---

# Data Requester


```jsx live=true

function Application() {
    // Create Entities
    const user = new EntitySchema('user');
    const userList = new ArraySchema(user);
    const ApplicationSchema = new ObjectSchema({user, userList});

    // Define Relationships
    user.shape = new ObjectSchema({
        friendList: userList
    });

    // Construct the api
    const Api = EntityApi({
        user: {
            getCurrent: () => Promise.resolve({
                id: '1',
                name: 'Derek Tibbs',
                age: 47
                friendList: 
            }),
            get: (id) => Promise.resolve({user: {id, name: Math.random()}})
        }
    }, ApplicationSchema);


    function UserProfile() {
        const userMessage = Api.user.get.useRequest();

        useEffect(() => {
            userMessage.onRequest('foo');
        }, []);



        return <LoadingBoundary message={userMessage} fallback={() => "Loading..."}>
            {({user}) => console.log(user) || <div>{user.id} {user.name}</div>}
        </LoadingBoundary>;

    }

    return <Api.Provider>
        <UserProfile />
    </Api.Provider>;
}
```
