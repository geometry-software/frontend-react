export type UserRole = "admin" | "user"

export type UserDto = {
  _id: string
  firstName: string
  lastName: string
  email: string
  createdAt?: string
  updatedAt?: string
}

export type CreateUserDto = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type UpdateUserDto = Partial<Omit<CreateUserDto, "password">> & {
  password?: string
}

export type UsersFilters = {
  text: string
  role: string
  createdAtFrom: string
  createdAtTo: string
}

export type UsersQuery = {
  query?: string
  createdAtFrom?: string
  createdAtTo?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}
