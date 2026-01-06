import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../app/store"
import type { ProductDto } from "../../lib/api-products"
import { mockListProducts } from "../../lib/mock-products-backend"

type SortDir = "asc" | "desc"

type ProductsState = {
  items: ProductDto[]
  total: number
  page: number
  limit: number
  search: string
  sortBy: keyof ProductDto | null
  sortDir: SortDir
  loading: boolean
  error: string | null
}

const initialState: ProductsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  search: "",
  sortBy: "name",
  sortDir: "asc",
  loading: false,
  error: null,
}

export const fetchProductsList = createAsyncThunk<
  { items: ProductDto[]; total: number },
  void,
  { state: RootState }
>("products/fetchList", async (_arg, thunkApi) => {
  const s = thunkApi.getState().products
  return mockListProducts({
    page: s.page,
    limit: s.limit,
    search: s.search,
    sortBy: (s.sortBy ?? undefined) as any,
    sortDir: s.sortDir,
  })
})

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload
      state.page = 1
    },
    setSort(state, action: PayloadAction<{ key: keyof ProductDto | null; dir: SortDir }>) {
      state.sortBy = action.payload.key
      state.sortDir = action.payload.dir
      state.page = 1
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProductsList.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductsList.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchProductsList.rejected, (state, action) => {
        state.loading = false
        state.error = (action.error.message ?? "Error al cargar productos")
      })
  },
})

export const { setSearch, setPage, setLimit, setSort } = productsSlice.actions
export default productsSlice.reducer
