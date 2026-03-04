export type ShippingStatus =
  | "pending"
  | "in_transit"
  | "on_the_way"
  | "delivered"
  | "cancelled"
  | "delayed"

export type ShippingItem = {
  id: string
  customer: string
  date: string
  destination: string
  status: ShippingStatus
  createdAt: string
  updatedAt: string
  history: { at: string; status: ShippingStatus; note?: string }[]
}