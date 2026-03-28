# Inertia.js Patterns (Laravel + React)

Use this reference when the project uses `@inertiajs/react`. Inertia handles routing, server data delivery via page props, and form submissions. Redux is only used for client-side state that persists across navigations.

## Component Layers

- **Page Layer**: Inertia page components that map one-to-one with Laravel routes. Receives server data via props. Does not contain business logic.
- **Component Layer**: Reusable UI building blocks. Receives data via props, emits events via callbacks. Pure and testable.
- **State Layer (Redux)**: Only for client-side state (UI preferences, notifications, ephemeral data). Server state comes from Inertia props — do not duplicate it in Redux.

```
User navigates to /users
  -> Laravel route: maps /users to UserController@index
  -> Inertia: renders Pages/User/Index.jsx with server props
  -> Page Layer: receives users via props
  -> Page Layer: renders UserList component with data

User navigates to /users/create
  -> Laravel route: maps /users/create to UserController@create
  -> Inertia: renders Pages/User/Create.jsx
  -> Page Layer: renders UserForm component
  -> Page Layer: on submit, uses useForm + Inertia.post (server handles redirect)
```

## Execution Steps
1. Shared constants and utilities (if needed)
2. State layer — Redux slice only if client-side state is needed
3. Component layer (reusable UI components)
4. Page layer (Inertia page that composes components and receives server props)
5. Test files
6. Brief explanation of architecture decisions

## Code Patterns

### Inertia Page

```jsx
import { Head } from '@inertiajs/react';
import UserList from '@/Components/UserList';

const Index = ({ users }) => {
  return (
    <>
      <Head title="Users" />
      <h1>Users</h1>
      <UserList users={users} />
    </>
  );
};

export default Index;
```

### Inertia Form Submission

```jsx
import { Head, useForm } from '@inertiajs/react';

const Create = () => {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/users');
  };

  return (
    <>
      <Head title="Create User" />
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
        />
        {errors.name && <span>{errors.name}</span>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
        />
        {errors.email && <span>{errors.email}</span>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => setData('password', e.target.value)}
        />
        {errors.password && <span>{errors.password}</span>}

        <button type="submit" disabled={processing}>
          Create User
        </button>
      </form>
    </>
  );
};

export default Create;
```
