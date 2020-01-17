---
title: useRequest
group: React Enty
---

The useRequest hook is the way api functions are bound to your components.

It returns a [Message] that contains all the necessary tools to request data and render something when it comes back. The hook handles the normalizing and denormalizing of the data so that you only need to worry about what data you want and when you want to ask for it.

```flow
useRequest(): Message
```

