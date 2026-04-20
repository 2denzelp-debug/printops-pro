// ─── Organizations ───────────────────────────────────────

export type Plan = 'TRIAL' | 'SOLO' | 'TEAM' | 'STUDIO' | 'AGENCY' | 'ENTERPRISE'
export type PlanStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'BLOCKED'
export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'GRAPHIC' | 'VIEWER'

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  accentColor: string
  plan: Plan
  planStatus: PlanStatus
  maxUsers: number
  vatNumber?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  createdAt: Date
}

export interface User {
  id: string
  organizationId: string
  email: string
  name: string
  avatar?: string
  role: Role
  department?: string
  isActive: boolean
  lastLogin?: Date
}

// ─── CRM ─────────────────────────────────────────────────

export interface Customer {
  id: string
  organizationId: string
  code: string
  name: string
  company?: string
  email?: string
  phone?: string
  whatsapp?: string
  address?: string
  city?: string
  vatNumber?: string
  status: string
  tags: string[]
  createdAt: Date
}

export interface Supplier {
  id: string
  organizationId: string
  code: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  leadTimeDays: number
  reliabilityScore: number
  isActive: boolean
}

// ─── Products & Materials ─────────────────────────────────

export interface Product {
  id: string
  organizationId: string
  code: string
  name: string
  category: string
  type: string
  unit: string
  basePrice: number
  isActive: boolean
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  size?: string
  color?: string
  material?: string
  priceOverride?: number
  isActive: boolean
}

export interface Material {
  id: string
  organizationId: string
  code: string
  name: string
  category: string
  unit: string
  supplierId?: string
  costPerUnit: number
  isActive: boolean
}

// ─── Inventory ───────────────────────────────────────────

export interface InventoryItem {
  id: string
  organizationId: string
  materialId?: string
  variantId?: string
  warehouseId: string
  locationId?: string
  qtyAvailable: number
  qtyReserved: number
  qtyMinThreshold: number
  material?: Material
  variant?: ProductVariant
  location?: WarehouseLocation
}

export interface WarehouseLocation {
  id: string
  warehouseId: string
  zone: string
  shelf?: string
  slot?: string
  label: string
}

export type MovementType = 'carico' | 'scarico' | 'trasferimento' | 'rettifica' | 'impegno' | 'rilascio'

// ─── Orders & Quotes ─────────────────────────────────────

export type QuoteStatus = 'bozza' | 'inviato' | 'in_attesa' | 'accettato' | 'rifiutato' | 'scaduto'
export type OrderStatus = 'nuovo' | 'confermato' | 'in_produzione' | 'completato' | 'spedito' | 'consegnato' | 'annullato'

export interface Quote {
  id: string
  organizationId: string
  code: string
  customerId: string
  status: QuoteStatus
  isUrgent: boolean
  validUntil?: Date
  totalAmount: number
  vatPct: number
  notes?: string
  customer?: Customer
  items?: QuoteItem[]
  createdAt: Date
}

export interface QuoteItem {
  id: string
  quoteId: string
  description: string
  qty: number
  unitPrice: number
  discountPct: number
  technique?: string
  total: number
}

export interface Order {
  id: string
  organizationId: string
  code: string
  customerId: string
  quoteId?: string
  source: string
  status: OrderStatus
  isUrgent: boolean
  priority: number
  dueDate?: Date
  totalAmount: number
  createdBy: string
  customer?: Customer
  items?: OrderItem[]
  createdAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  description: string
  qty: number
  unitPrice: number
  technique?: string
  artworkUrl?: string
  total: number
}

// ─── Production ──────────────────────────────────────────

export type ProdStatus = 'da_iniziare' | 'in_corso' | 'bloccato' | 'completato' | 'annullato'

export interface ProductionJob {
  id: string
  organizationId: string
  orderId: string
  status: ProdStatus
  isUrgent: boolean
  priority: number
  assignedTo?: string
  startedAt?: Date
  completedAt?: Date
  order?: Order
  steps?: ProductionStep[]
}

export interface ProductionStep {
  id: string
  productionJobId: string
  stepType: string
  status: string
  machineId?: string
  assignedTo?: string
  orderIndex: number
}

// ─── DTF ─────────────────────────────────────────────────

export interface DtfOrder {
  id: string
  organizationId: string
  code: string
  customerId?: string
  orderId?: string
  description: string
  filmWidth: string
  meters: number
  colors?: string
  status: string
  filmConsumed: number
  inkConsumed?: Record<string, number>
  createdAt: Date
}

// ─── Stickers ────────────────────────────────────────────

export interface StickerOrder {
  id: string
  organizationId: string
  code: string
  description: string
  width: number
  height: number
  unit: string
  quantity: number
  material: string
  finishing?: string
  status: string
  createdAt: Date
}

// ─── Employees & Attendance ───────────────────────────────

export interface Employee {
  id: string
  organizationId: string
  name: string
  email?: string
  phone?: string
  role: string
  department?: string
  hourlyRate: number
  monthlyHours: number
  isActive: boolean
  qrCode?: string
}

export interface Attendance {
  id: string
  employeeId: string
  date: Date
  checkIn?: Date
  checkOut?: Date
  hoursWorked: number
  overtime: number
  type: string
}

// ─── Machines ────────────────────────────────────────────

export type MachineStatus = 'operativa' | 'guasta' | 'manutenzione' | 'dismessa'

export interface Machine {
  id: string
  organizationId: string
  name: string
  type: string
  status: MachineStatus
  location?: string
  serialNumber?: string
  lastMaintenanceAt?: Date
  nextMaintenanceAt?: Date
  notes?: string
}

// ─── Finance ─────────────────────────────────────────────

export type FinancialType = 'entrata' | 'uscita' | 'accantonamento'

export interface FinancialEntry {
  id: string
  organizationId: string
  type: FinancialType
  category: string
  description: string
  amount: number
  date: Date
  referenceType?: string
  referenceId?: string
  createdBy: string
}

// ─── Shipments ───────────────────────────────────────────

export type ShipmentStatus = 'da_preparare' | 'pronta' | 'spedita' | 'in_transito' | 'consegnata' | 'problema'

export interface Shipment {
  id: string
  organizationId: string
  orderId: string
  customerId: string
  recipientName: string
  address: string
  city: string
  status: ShipmentStatus
  trackingNumber?: string
  shippedAt?: Date
  packages?: ShipmentPackage[]
}

export interface ShipmentPackage {
  id: string
  shipmentId: string
  weightKg?: number
  contentNotes?: string
}

// ─── AI ──────────────────────────────────────────────────

export interface AiToolResult {
  success: boolean
  data?: unknown
  error?: string
}

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  functionCalled?: string
}

// ─── API Responses ───────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  upgrade?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
