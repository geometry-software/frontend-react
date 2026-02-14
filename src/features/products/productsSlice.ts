import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../app/store"
import { fetchProducts } from "../../lib/api-products"
import type { ProductDto } from "../../lib/api-products"
import type { ProductsFilters, SortDir } from "../../types/filters"

type ProductsState = {
  items: ProductDto[]
  total: number
  page: number
  limit: number
  sortBy: string
  sortDir: SortDir
  filters: ProductsFilters
  loading: boolean
  error: string | null
}

const initialState: ProductsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortDir: "desc",
  filters: {
    text: "",
    inName: false,
    inDescription: false,
    inPrice: false,
    createdAtFrom: "",
    createdAtTo: "",
  },
  loading: false,
  error: null,
}

function buildSearchParams(filters: ProductsFilters) {
  const textRaw = (filters.text || "").trim()
  const text = textRaw.toLowerCase()

  const createdAtFrom = (filters.createdAtFrom || "").trim()
  const createdAtTo = (filters.createdAtTo || "").trim()

  const base: Record<string, string> = {}
  if (createdAtFrom) base.createdAtFrom = createdAtFrom
  if (createdAtTo) base.createdAtTo = createdAtTo

  if (!text) return base

  const anyChecked = filters.inName || filters.inDescription || filters.inPrice

  if (!anyChecked) {
    return { ...base, query: text }
  }

  const onlyName = filters.inName && !filters.inDescription && !filters.inPrice
  const onlyDesc = !filters.inName && filters.inDescription && !filters.inPrice
  const onlyPrice = !filters.inName && !filters.inDescription && filters.inPrice

  if (onlyName) return { ...base, query: text }
  if (onlyDesc) return { ...base, query: text }
  if (onlyPrice) return { ...base, query: text }

  return { ...base, query: text }
}


export const fetchProductsPage = createAsyncThunk(
  "products/fetchProductsPage",
  async (_: void, thunkApi) => {
    const s = (thunkApi.getState() as RootState).products
    const search = buildSearchParams(s.filters)

    return fetchProducts({
      page: s.page,
      limit: s.limit,
      sortBy: s.sortBy || undefined,
      sortOrder: s.sortDir,
      ...search,
    } as any)
  }
)

const productsSlice = createSlice({
  name: "products",
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
    setFilters(state, action: PayloadAction<ProductsFilters>) {
      state.filters = action.payload
      state.page = 1
    },
    clearFilters(state) {
      state.filters = {
        text: "",
        inName: false,
        inDescription: false,
        inPrice: false,
        createdAtFrom: "",
        createdAtTo: "",
      }
      state.page = 1
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProductsPage.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductsPage.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items ?? []
        state.total = action.payload.total ?? 0
      })
      .addCase(fetchProductsPage.rejected, (state, action) => {
        state.loading = false
        state.items = []
        state.total = 0
        state.error = action.error?.message || "Error al cargar productos"
      })
  },
})

export const { setPage, setLimit, setSort, setFilters, clearFilters } =
  productsSlice.actions

export default productsSlice.reducer


