import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { RootState } from 'src/redux/store';
import { setAccessToken, logout } from 'src/redux/slices/authSlice';
import { config } from 'src/config';
import { QueryReturnValue } from 'node_modules/@reduxjs/toolkit/dist/query/baseQueryTypes';

interface RefreshTokenResponse {
  data: {
    accessToken: string;
  };
}

interface Custom {
  [key: string]: string;
}

// Base query setup with headers
const baseQuery = fetchBaseQuery({
  baseUrl: config.BACKEND_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
  credentials: 'include',
});

// Extended base query with re-authentication logic
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt to get a new token using the refresh token
    const refreshResult = await baseQuery(
      {
        url: '/user/refresh-access-token',
        method: 'POST',
      },
      api,
      extraOptions
    );

    if (
      refreshResult.data &&
      (refreshResult.data as RefreshTokenResponse)?.data?.accessToken
    ) {
      const newToken = (refreshResult.data as RefreshTokenResponse).data
        .accessToken;

      // Store the new token in Redux
      api.dispatch(setAccessToken(newToken));
      // Retry the original query with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      try {
        await baseQuery(
          {
            url: '/user/logout',
            method: 'POST',
          },
          api,
          extraOptions
        );
        api.dispatch(logout());
      } catch (error) {
        console.error('Failed to logout', error);
      }
    }
  }

  return result.data as QueryReturnValue<unknown, FetchBaseQueryError, Custom>;
};

export { baseQuery, baseQueryWithReauth };
