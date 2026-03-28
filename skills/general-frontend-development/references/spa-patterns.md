# Standalone React SPA Patterns

Use this reference when the project is a standalone React application (e.g. Create React App, Vite React template, custom setup). The app manages its own routing (React Router), fetches data from APIs, and uses Redux for both server and client state.

## Component Layers

- **Page/View Layer**: Route-level components mapped via React Router. Dispatches async thunks on mount to fetch data. Composes child components.
- **Component Layer**: Reusable UI building blocks. Receives data via props, emits events via callbacks. Pure and testable.
- **State Layer (Redux)**: Full state management — slices, selectors, and async thunks for API calls. All server data flows through Redux.

```
User navigates to /users
  -> React Router: maps /users to Pages/User/Index.jsx
  -> Page Layer: dispatches fetchUsers thunk on mount
  -> State Layer: thunk calls GET /api/users, stores result in Redux
  -> Page Layer: reads users from Redux store via selector
  -> Page Layer: renders UserList component with data

User navigates to /users/create
  -> React Router: maps /users/create to Pages/User/Create.jsx
  -> Page Layer: renders UserForm component
  -> Page Layer: on submit, dispatches createUser thunk
  -> State Layer: thunk calls POST /api/users, updates store on success
  -> Page Layer: redirects to /users via useNavigate
```

## Execution Steps
1. Shared constants and utilities (if needed)
2. State layer (Redux slice, selectors, async thunks for API calls)
3. Component layer (reusable UI components)
4. Page/View layer (route-level page that composes components and dispatches thunks)
5. Test files
6. Brief explanation of architecture decisions

## Code Patterns

### Redux Slice with Async Thunk

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    const response = await fetch('/api/users');
    if (!response.ok) {
      return rejectWithValue('Failed to fetch users');
    }
    return response.json();
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue }) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      return rejectWithValue('Failed to create user');
    }
    return response.json();
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectUsers = (state) => state.user.users;
export const selectLoading = (state) => state.user.loading;
export const selectError = (state) => state.user.error;

export default userSlice.reducer;
```

### SPA Page with Data Fetching

```jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, selectUsers, selectLoading } from '@/store/userSlice';
import UserList from '@/Components/UserList';

const Index = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectLoading);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1>Users</h1>
      <UserList users={users} />
    </>
  );
};

export default Index;
```

### SPA Form with Redux Submit

```jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createUser } from '@/store/userSlice';

const Create = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const handleChange = (field) => (e) => {
    setData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await dispatch(createUser(data)).unwrap();
      navigate('/users');
    } catch (err) {
      setErrors(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <h1>Create User</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={handleChange('name')}
        />
        {errors.name && <span>{errors.name}</span>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={handleChange('email')}
        />
        {errors.email && <span>{errors.email}</span>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={data.password}
          onChange={handleChange('password')}
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

### Redux Reducer Test

```javascript
import { describe, it, expect } from 'vitest';
import reducer from './userSlice';
import { fetchUsers } from './userSlice';

describe('userSlice', () => {
  it('sets loading on fetchUsers.pending', () => {
    const state = reducer(undefined, fetchUsers.pending());

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('sets users on fetchUsers.fulfilled', () => {
    const users = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];
    const state = reducer(undefined, fetchUsers.fulfilled(users));

    expect(state.users).toEqual(users);
    expect(state.loading).toBe(false);
  });

  it('sets error on fetchUsers.rejected', () => {
    const state = reducer(undefined, fetchUsers.rejected(null, '', null, 'Failed'));

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed');
  });
});
```
