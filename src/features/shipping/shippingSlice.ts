import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../app/store"
import type { ShippingItem, ShippingStatus } from "../../types/shipping"
import type { ShippingFilters, SortDir } from "../../types/filters"
import {
  listShipments,
  createShipment,
  updateShipment,
  deleteShipment,
  updateShipmentStatus,
} from "../../lib/mock-shipping"

type ShippingState = {
  items: ShippingItem[]
  total: number
  page: number
  limit: number
  sortBy: string
  sortDir: SortDir
  filters: ShippingFilters
  loading: boolean
  error: string | null
}

const initialState: ShippingState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortDir: "desc",
  filters: {
    text: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
  },
  loading: false,
  error: null,
}

export const fetchShipments = createAsyncThunk(
  "shipping/fetchShipments",
  async (_: void, thunkApi) => {
    const s = (thunkApi.getState() as RootState).shipping
    return listShipments({
      page: s.page,
      limit: s.limit,
      sortBy: s.sortBy,
      sortDir: s.sortDir,
      text: s.filters.text,
      status: s.filters.status,
      dateFrom: s.filters.dateFrom,
      dateTo: s.filters.dateTo,
    })
  }
)

export const addShipment = createAsyncThunk(
  "shipping/addShipment",
  async (dto: { customer: string; date: string; destination: string }, thunkApi) => {
    const res = await createShipment(dto)
    thunkApi.dispatch(fetchShipments())
    return res
  }
)

export const editShipment = createAsyncThunk(
  "shipping/editShipment",
  async (args: { id: string; dto: Partial<{ customer: string; date: string; destination: string }> }, thunkApi) => {
    const res = await updateShipment(args.id, args.dto)
    thunkApi.dispatch(fetchShipments())
    return res
  }
)

export const removeShipment = createAsyncThunk("shipping/removeShipment", async (id: string, thunkApi) => {
  await deleteShipment(id)
  thunkApi.dispatch(fetchShipments())
  return id
})

export const setShipmentStatusAction = createAsyncThunk(
  "shipping/setShipmentStatus",
  async (args: { id: string; status: ShippingStatus; note?: string }, thunkApi) => {
    const res = await updateShipmentStatus(args.id, args.status, args.note)
    thunkApi.dispatch(fetchShipments())
    return res
  }
)

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload
      state.page = 1
    },
    setSort(state, action: PayloadAction<{ sortBy: string; sortDir: SortDir }>) {
      state.sortBy = action.payload.sortBy
      state.sortDir = action.payload.sortDir
      state.page = 1
    },
    setFilters(state, action: PayloadAction<ShippingFilters>) {
      state.filters = action.payload
      state.page = 1
    },
    clearFilters(state) {
      state.filters = {
        text: "",
        status: "all",
        dateFrom: "",
        dateTo: "",
      }
      state.page = 1
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchShipments.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.total = action.payload.total || 0
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error?.message || "Error cargando envíos"
      })
  },
})

export const { setPage, setLimit, setSort, setFilters, clearFilters } = shippingSlice.actions
export default shippingSlice.reducer