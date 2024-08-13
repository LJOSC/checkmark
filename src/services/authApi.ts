import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './common';

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginPayload, unknown>({
      query: (payload: LoginPayload) => ({
        url: '/user/login',
        method: 'POST',
        body: payload,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/user/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
