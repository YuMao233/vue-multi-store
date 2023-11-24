# vue-multi-store

Helps you quickly write data sharing between components and reduce coupling between components when using Vue3.

## What's this?

In most cases, Vue's state management was originally designed to store only one piece of data, such as a user's information or a work order's information.

If you want to store multiple pieces of information at the same time, you need to modify the implementation plan, that is, refactor the code.

But thanks to the combined API of Vue3, we can design a set of such API to quickly store any different types of information for multiple components.

```html
<script lang="ts" setup>
  //interface.ts
  interface UserInfo {
    name: string;
    age: 18;
  }

  onMounted(async () => {
    const uid = router.query.id; // User Id
    const resultUserInfo = await request(); // do something...

    //Set any type of data and share it
    // Parameter 1: Data category
    // Parameter 2: Data ID
    // Parameter 3: New data value set
    setState<UserInfo>("User", uid, {
      name: "My Name",
      age: 18,
    });
  });
</script>

<template>
  <div>
    <h4>User Info:</h4>
    <child-component></child-component>
  </div>
</template>
```

Subcomponents use:

```html
<!-- Child component -->
<script lang="ts" setup>
  const uid = router.query.id; // User Id, or use props
  // Get user information
  // Parameter 1: Data category
  // Parameter 2: Data ID
  // Return: Ref<UserInfo | undefined>
  const userInfo = getState<UserInfo>("User", uid);

  // Change UserInfo asynchronously, the parent component and other components that use this data will be updated responsively
  setTimeout(() => {
    if (userInfo.value) userInfo.value.name = "Yoooo~";
  }, 6000);
</script>

<template>
  <div v-if="userInfo">{{ userInfo }}</div>
  <div v-else>Loading...</div>
</template>
```

## Conclusion

From the above code, we can conclude that the subcomponent will get a `Ref<UserInfo | undefined>`. This data will be changed responsively due to changes in other components, so it can be applied to many scenarios, such as subcomponents and sibling components. Even the data of the parent component is shared.

It is used to decouple the high coupling between parent, child, and sibling components, so that multiple Vue components no longer rely on props to pass values to each other, resulting in deep binding. Everyone depends on this global "state" and also implements responsiveness. Synchronous updates can effectively solve the problem of high coupling between components.

![image](./docs/examples_1.png)

## shortcoming

Violating the principle of single data flow of Vue3, it may cause some confusion over time. This is because the main design inspiration comes from Redis, which is often used by back-end development to achieve data sharing.

## Memory recycling processing

As you can see, there are various "states" with UID=1 and UID=2 that persist, but some data must be recycled when they are no longer needed.
Thanks to the combined API, we implement calculation based on references, and release related instances based on the reference number box after the component is destroyed.
