---
title: Service Based APIs.
group: Common
---

### Combining Multiple Apis

Because the api is declarative, it is easy to split portions of your api into different files.

```js
// UserApi.js
export default {
    get: payload => request.get('/user', payload),
    create: payload => request.post('/user', payload),
    save: payload => request.post(`/user/${payload.id}`, payload)
};

// CourseApi.js
export default {
    get: payload => request.get('/course', payload),
    create: payload => request.post('/course', payload),
    save: payload => request.post(`/course/${payload.id}`, payload)
};

// EntityApi.js
import UserApi from './UserApi';
import CourseApi from './CourseApi';
const Api = EntityApi({
    user: UserApi,
    course: CourseApi
}, EntitySchema);

```
