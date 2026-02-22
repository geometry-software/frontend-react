import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { ShippingItem, ShippingStatus } from "../../types/shipping"
import {
  listShipments,
  createShipment,
  updateShipment,
  deleteShipment,
  updateShipmentStatus,
} from "../../lib/mock-shipping"

type ShippingState = {
  items: ShippingItem[]
  loading: boolean
  error: string | null
}

const initialState: ShippingState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchShipments = createAsyncThunk("shipping/fetchShipments", async () => {
  return listShipments()
})

export const addShipment = createAsyncThunk(
  "shipping/addShipment",
  async (dto: { customer: string; date: string; destination: string }) => {
    return createShipment(dto)
  }
)

export const editShipment = createAsyncThunk(
  "shipping/editShipment",
  async (args: { id: string; dto: Partial<{ customer: string; date: string; destination: string }> }) => {
    return updateShipment(args.id, args.dto)
  }
)

export const removeShipment = createAsyncThunk("shipping/removeShipment", async (id: string) => {
  await deleteShipment(id)
  return id
})

export const setShipmentStatus = createAsyncThunk(
  "shipping/setShipmentStatus",
  async (args: { id: string; status: ShippingStatus; note?: string }) => {
    return updateShipmentStatus(args.id, args.status, args.note)
  }
)

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchShipments.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchShipments.fulfilled, (state, action: PayloadAction<ShippingItem[]>) => {
        state.loading = false
        state.items = action.payload || []
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error?.message || "Error cargando envíos"
      })
      .addCase(addShipment.fulfilled, (state, action: PayloadAction<ShippingItem>) => {
        state.items = [action.payload, ...state.items]
      })
      .addCase(editShipment.fulfilled, (state, action: PayloadAction<ShippingItem>) => {
        state.items = state.items.map(x => (x.id === action.payload.id ? action.payload : x))
      })
      .addCase(removeShipment.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(x => x.id !== action.payload)
      })
      .addCase(setShipmentStatus.fulfilled, (state, action: PayloadAction<ShippingItem>) => {
        state.items = state.items.map(x => (x.id === action.payload.id ? action.payload : x))
      })
  },
})

export default shippingSlice.reducer