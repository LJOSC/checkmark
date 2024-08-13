import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { authApi } from 'src/services/authApi';

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
});

export default rootReducer;
