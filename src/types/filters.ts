export type SortDir = "asc" | "desc"

export type ProductsFilters = {
  text: string
  inName: boolean
  inDescription: boolean
  inPrice: boolean
  createdAtFrom: string
  createdAtTo: string
}

export type ShippingFilters = {
  text: string
  status: string 
  createdAtFrom: string
  createdAtTo: string
}

export type FilterProps<T> = {
  value: T
  onApply: (next: T) => void
  onClear: () => void
}
