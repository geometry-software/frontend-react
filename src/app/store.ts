import { configureStore } from "@reduxjs/toolkit"
import productsReducer from "../features/products/productsSlice"
import shippingReducer from "../features/shipping/shippingSlice"

export const store = configureStore({
  reducer: {
    products: productsReducer,
    shipping: shippingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch