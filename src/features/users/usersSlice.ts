import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../app/store"
import { fetchUsers } from "../../lib/api-users"
import type { UserDto, UsersFilters } from "../../types/users"
import type { SortDir } from "../../types/filters"

type UsersState = {
  items: UserDto[]
  total: number
  page: number
  limit: number
  sortBy: string
  sortDir: SortDir
  filters: UsersFilters
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortDir: "desc",
  filters: {
    text: "",
    role: "",
    createdAtFrom: "",
    createdAtTo: "",
  },
  loading: false,
  error: null,
}

function buildSearchParams(filters: UsersFilters) {
  const base: Record<string, string> = {}

  const text = (filters.text || "").trim().toLowerCase()
  if (text) base.query = text

  if (filters.role) base.role = filters.role

  const createdAtFrom = (filters.createdAtFrom || "").trim()
  const createdAtTo = (filters.createdAtTo || "").trim()
  if (createdAtFrom) base.createdAtFrom = createdAtFrom
  if (createdAtTo) base.createdAtTo = createdAtTo

  return base
}

export const fetchUsersPage = createAsyncThunk(
  "users/fetchUsersPage",
  async (_: void, thunkApi) => {
    const s = (thunkApi.getState() as RootState).users
    const search = buildSearchParams(s.filters)

    return fetchUsers({
      page: s.page,
      limit: s.limit,
      sortBy: s.sortBy || undefined,
      sortOrder: s.sortDir,
      ...search,
    })
  }
)

const usersSlice = createSlice({
  name: "users",
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
    setFilters(state, action: PayloadAction<UsersFilters>) {
      state.filters = action.payload
      state.page = 1
    },
    clearFilters(state) {
      state.filters = {
        text: "",
        role: "",
        createdAtFrom: "",
        createdAtTo: "",
      }
      state.page = 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersPage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsersPage.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items ?? []
        state.total = action.payload.total ?? 0
      })
      .addCase(fetchUsersPage.rejected, (state, action) => {
        state.loading = false
        state.items = []
        state.total = 0
        state.error = action.error?.message || "Error al cargar usuarios"
      })
  },
})

export const { setPage, setLimit, setSort, setFilters, clearFilters } =
  usersSlice.actions

export default usersSlice.reducer
