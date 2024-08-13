import { configureStore, Middleware } from '@reduxjs/toolkit';
import { authApi } from 'src/services/authApi';
import rootReducer from './reducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware as Middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
