export type DeliveryWindow = {
  label: string
  startMinute: number | null
  endMinute: number | null
  source: string
}

export type PlanningClient = {
  clientId: string
  name: string
  address: string
  postalCode: string
  city: string
  currentSequence: number
  deliveries: readonly string[]
  lines: number
  weightKg: number
  volumeM3: number
  pallets: number
  returnableUnits: number
  hasReturnables: boolean
  productTypes: readonly string[]
  lat: number
  lng: number
  geocodeSource: string
  window: DeliveryWindow
  serviceMinutes: number
  priorityScore: number
  priorityLabel: string
  priorityReasons: readonly string[]
  loadDifficulty: number
}

export type PlanningMaterialBreakdownItem = {
  material: string
  quantity: number
}

export type PlanningLoadRow = {
  lineId: string
  clientId: string
  clientName: string
  material: string
  materialBreakdown?: readonly PlanningMaterialBreakdownItem[]
  product: string
  quantity: number
  unit: string
  productType: string
  weightKg: number
  volumeM3: number
  pallets: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  returnable: boolean
  metricSource: string
  dimensionSource?: string
}

export type PlanningDaySummary = {
  date: string
  clients: number
  lines: number
  deliveries: number
  materials: number
  weightKg: number
  volumeM3: number
  pallets: number
  returnableShare: number
}

export type PlanningDay = {
  date: string
  summary: PlanningDaySummary
  clients: readonly PlanningClient[]
  masterRows: readonly PlanningLoadRow[]
}

export type TruckType = {
  id: string
  label: string
  shortLabel: string
  palletCapacity: number
  defaultAvailable: number
  fixedCostMinutes: number
  source: string
}

export type Depot = {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
}

export type PlanningDataset = {
  generatedAt: string
  source: string
  depot: Depot
  truckTypes: readonly TruckType[]
  dates: readonly PlanningDaySummary[]
  days: Record<string, PlanningDay>
}
