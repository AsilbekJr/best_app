import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ['Products', 'Categories', 'Branches', 'Orders'],
  endpoints: (builder) => ({
    getCategories: builder.query<any[], void>({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),
    getProducts: builder.query<any[], void>({
      query: () => '/products',
      providesTags: ['Products'],
    }),
    getBranches: builder.query<any[], void>({
      query: () => '/branches',
      providesTags: ['Branches'],
    }),
    createOrder: builder.mutation<any, any>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),
    checkPromo: builder.mutation<any, any>({
      query: (promoData) => ({
        url: '/check-promo',
        method: 'POST',
        body: promoData,
      }),
    }),
    getMyOrders: builder.query<any[], string>({
      query: (chatId) => `/orders/my/${chatId}`,
      providesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetBranchesQuery,
  useCreateOrderMutation,
  useCheckPromoMutation,
  useGetMyOrdersQuery,
} = apiSlice;

export default apiSlice;
