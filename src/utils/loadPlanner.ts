import productSizeCatalog from '@/data/productSizeCatalog.generated.json'

export type ClientLoadInput = {
  clientId: string
  name: string
  optimizedSequence: number
  weightKg: number
  volumeM3: number
  pallets: number
}

export type MaterialBreakdownItem = {
  material: string
  quantity: number
}

export type MasterLoadRow = {
  lineId: string
  clientId: string
  clientName: string
  material: string
  materialBreakdown?: readonly MaterialBreakdownItem[]
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
  orientation?: ProductOrientation
  returnable: boolean
  metricSource: string
  dimensionSource?: string
}

export type LoadShape = 'box' | 'cylinder' | 'crate'
export type ProductOrientation = 'horizontal' | 'vertical' | 'unknown'

export type MaterialRule = {
  type: string
  label: string
  color: string
  shape: LoadShape
  stackRank: number
}

export type PalletClient = {
  clientId: string
  name: string
  stop: number
}

export type LoadPiece = {
  id: string
  clientId: string
  clientName: string
  stop: number
  productType: string
  materialBreakdown: readonly MaterialBreakdownItem[]
  materialCodes: readonly string[]
  products: readonly string[]
  quantity: number
  unit: string
  weightKg: number
  volumeM3: number
  palletShare: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  orientation: ProductOrientation
  color: string
  dimensionSource?: string
  shape: LoadShape
}

export type TruckPallet = {
  id: string
  index: number
  slotNumber: number
  row: number
  lane: 'left' | 'right'
  positionLabel: string
  accessLabel: string
  clients: readonly PalletClient[]
  pieces: readonly LoadPiece[]
  usedPallets: number
  utilization: number
  weightKg: number
  volumeM3: number
  stopRange: readonly [number, number] | null
  isEmpty: boolean
  reservedForReturnables: boolean
  warnings: readonly string[]
}

export type TruckLoadPlan = {
  pallets: readonly TruckPallet[]
  materialLegend: readonly MaterialRule[]
  summary: {
    occupiedPallets: number
    totalSlots: number
    usedPallets: number
    weightKg: number
    volumeM3: number
    utilization: number
    leftWeightKg: number
    rightWeightKg: number
    reservedReturnablePallets: number
    reservedSlots: number
    overflow: boolean
  }
  constraints: {
    slots: number
    palletWeightKg: number
    palletVolumeM3: number
    palletShare: number
  }
}

const PALLET_SHARE_LIMIT = 0.98
const PALLET_WEIGHT_LIMIT_KG = 900
const PALLET_VOLUME_LIMIT_M3 = 1.25
const MAX_STOPS_PER_PALLET = 3
const MAX_STOP_SPAN_PER_PALLET = 2
const MIN_PACKING_SHARE = 0.006

type ProductSizeCatalogItem = {
  type: string
  material: string
  product: string
  unit: string
  lengthCm: number
  widthCm: number
  heightCm: number
  orientation: ProductOrientation
  dimensionSource: string
}

type PieceDimensions = {
  lengthCm: number
  widthCm: number
  heightCm: number
  orientation: ProductOrientation
  dimensionSource: string
}

const PRODUCT_SIZE_BY_MATERIAL = buildProductSizeLookup(
  productSizeCatalog as readonly ProductSizeCatalogItem[],
)

const MATERIAL_RULES: Record<string, MaterialRule> = {
  barril: {
    type: 'barril',
    label: 'Barril',
    color: '#D7DBE0',
    shape: 'cylinder',
    stackRank: 1,
  },
  retornable: {
    type: 'retornable',
    label: 'Retornable',
    color: '#2F8F5B',
    shape: 'crate',
    stackRank: 2,
  },
  caja: {
    type: 'caja',
    label: 'Caja',
    color: '#C53030',
    shape: 'box',
    stackRank: 3,
  },
  lata: {
    type: 'lata',
    label: 'Lata',
    color: '#33424F',
    shape: 'box',
    stackRank: 4,
  },
  otros: {
    type: 'otros',
    label: 'Otros',
    color: '#6D5E8C',
    shape: 'box',
    stackRank: 5,
  },
}

type PieceDraft = Omit<LoadPiece, 'id' | 'weightKg' | 'volumeM3' | 'palletShare' | 'quantity'> & {
  baseId: string
  weightKg: number
  volumeM3: number
  palletShare: number
  quantity: number
}

type PalletDraft = {
  pieces: LoadPiece[]
  usedPallets: number
  weightKg: number
  volumeM3: number
  warnings: string[]
}

export function materialRuleFor(productType: string): MaterialRule {
  return MATERIAL_RULES[productType] ?? MATERIAL_RULES.otros
}

export function buildTruckLoadPlan(
  clients: readonly ClientLoadInput[],
  rows: readonly MasterLoadRow[],
  options: { reservedReturnablePallets?: number; slots?: number } = {},
): TruckLoadPlan {
  const truckSlots = options.slots ?? 8
  const reservedReturnablePallets = Math.max(0, options.reservedReturnablePallets ?? 0)
  const fullReserveSlots = Math.floor(reservedReturnablePallets / PALLET_SHARE_LIMIT)
  const fractionalReserve = reservedReturnablePallets - fullReserveSlots * PALLET_SHARE_LIMIT
  const reservedSlots = Math.min(
    Math.max(0, truckSlots - 1),
    fullReserveSlots + (fractionalReserve >= 0.65 ? 1 : 0),
  )
  const usableSlots = Math.max(1, truckSlots - reservedSlots)
  const orderedClients = [...clients].sort((a, b) => a.optimizedSequence - b.optimizedSequence)
  const rowsByClient = groupRowsByClient(rows)
  const palletDrafts: PalletDraft[] = []
  let current = createPalletDraft()
  let overflow = false

  for (const client of orderedClients) {
    const clientPieces = buildClientPieces(client, rowsByClient.get(client.clientId) ?? [])
    const clientShare = clientPieces.reduce((total, piece) => total + piece.palletShare, 0)

    if (current.pieces.length > 0 && !canMixClient(current, client, clientShare)) {
      palletDrafts.push(current)
      current = createPalletDraft()
    }

    for (const piece of clientPieces) {
      let remainingShare = piece.palletShare
      let remainingWeight = piece.weightKg
      let remainingVolume = piece.volumeM3
      let remainingQuantity = piece.quantity
      let splitIndex = 1

      while (remainingShare > 0.0001) {
        if (!canFitAnything(current, piece) && current.pieces.length > 0) {
          palletDrafts.push(current)
          current = createPalletDraft()
        }

        const portionShare = fitPortion(current, {
          ...piece,
          palletShare: remainingShare,
          weightKg: remainingWeight,
          volumeM3: remainingVolume,
        })

        if (portionShare <= 0.0001) {
          if (palletDrafts.length >= usableSlots - 1) {
            overflow = true
            current.warnings.push('Capacidad ajustada al límite del camión')
            current = forceAddPiece(current, piece, remainingShare, remainingWeight, remainingVolume, remainingQuantity, splitIndex)
            break
          }
          palletDrafts.push(current)
          current = createPalletDraft()
          continue
        }

        const ratio = portionShare / remainingShare
        const portionWeight = remainingWeight * ratio
        const portionVolume = remainingVolume * ratio
        const portionQuantity = remainingQuantity * ratio

        current = addPiece(current, piece, portionShare, portionWeight, portionVolume, portionQuantity, splitIndex)

        remainingShare -= portionShare
        remainingWeight -= portionWeight
        remainingVolume -= portionVolume
        remainingQuantity -= portionQuantity
        splitIndex += 1
      }
    }
  }

  if (current.pieces.length > 0 || palletDrafts.length === 0) {
    palletDrafts.push(current)
  }

  if (palletDrafts.length > usableSlots) {
    overflow = true
  }

  const occupiedDrafts = palletDrafts.slice(0, usableSlots)
  const pallets = buildTruckSlots(occupiedDrafts, truckSlots, reservedSlots)
  const materialLegend = [...new Set(pallets.flatMap((pallet) => pallet.pieces.map((piece) => piece.productType)))]
    .map(materialRuleFor)
    .sort((a, b) => a.stackRank - b.stackRank)

  const leftWeightKg = pallets
    .filter((pallet) => pallet.lane === 'left')
    .reduce((total, pallet) => total + pallet.weightKg, 0)
  const rightWeightKg = pallets
    .filter((pallet) => pallet.lane === 'right')
    .reduce((total, pallet) => total + pallet.weightKg, 0)
  const usedPallets = pallets.reduce((total, pallet) => total + pallet.usedPallets, 0)
  const weightKg = pallets.reduce((total, pallet) => total + pallet.weightKg, 0)
  const volumeM3 = pallets.reduce((total, pallet) => total + pallet.volumeM3, 0)

  return {
    pallets,
    materialLegend,
    summary: {
      occupiedPallets: pallets.filter((pallet) => !pallet.isEmpty).length,
      totalSlots: truckSlots,
      usedPallets: roundTwo(usedPallets),
      weightKg: roundOne(weightKg),
      volumeM3: roundTwo(volumeM3),
      utilization: roundOne((usedPallets / truckSlots) * 100),
      leftWeightKg: roundOne(leftWeightKg),
      rightWeightKg: roundOne(rightWeightKg),
      reservedReturnablePallets: roundTwo(reservedReturnablePallets),
      reservedSlots,
      overflow,
    },
    constraints: {
      slots: truckSlots,
      palletWeightKg: PALLET_WEIGHT_LIMIT_KG,
      palletVolumeM3: PALLET_VOLUME_LIMIT_M3,
      palletShare: PALLET_SHARE_LIMIT,
    },
  }
}

function groupRowsByClient(rows: readonly MasterLoadRow[]) {
  const rowsByClient = new Map<string, MasterLoadRow[]>()
  for (const row of rows) {
    const clientRows = rowsByClient.get(row.clientId) ?? []
    clientRows.push(row)
    rowsByClient.set(row.clientId, clientRows)
  }
  return rowsByClient
}

function buildClientPieces(client: ClientLoadInput, rows: readonly MasterLoadRow[]): PieceDraft[] {
  const groups = new Map<string, PieceDraft & {
    dimensionSources: readonly string[]
    dimensionWeight: number
    rowCount: number
  }>()

  for (const row of rows) {
    if (row.returnable) {
      continue
    }

    const materialBreakdown = materialBreakdownForRow(row)
    const breakdownTotal = materialBreakdown.reduce((total, item) => total + Math.max(0, item.quantity), 0)

    for (const item of materialBreakdown) {
      const material = item.material || row.material || row.productType || 'otros'
      const catalogItem = PRODUCT_SIZE_BY_MATERIAL.get(material)
      const productType = row.productType || catalogItem?.type || 'otros'
      const dimensions = dimensionsForMaterial(row, material, productType)
      const rule = materialRuleFor(productType)
      const key = pieceGroupKey(productType, material, dimensions)
      const ratio = breakdownTotal > 0
        ? Math.max(0, item.quantity) / breakdownTotal
        : 1 / Math.max(1, materialBreakdown.length)
      const current = groups.get(key) ?? {
        baseId: `${client.clientId}-${safeId(key)}`,
        clientId: client.clientId,
        clientName: client.name,
        stop: client.optimizedSequence,
        productType,
        materialBreakdown: [],
        materialCodes: [],
        products: [],
        quantity: 0,
        unit: catalogItem?.unit || row.unit,
        weightKg: 0,
        volumeM3: 0,
        palletShare: 0,
        lengthCm: 0,
        widthCm: 0,
        heightCm: 0,
        orientation: dimensions.orientation,
        color: rule.color,
        dimensionSource: '',
        dimensionSources: [],
        dimensionWeight: 0,
        shape: rule.shape,
        rowCount: 0,
      }

      const quantity = breakdownTotal > 0 ? item.quantity : row.quantity * ratio
      const dimensionWeight = Math.max(quantity, 1)
      current.quantity += quantity
      current.weightKg += row.weightKg * ratio
      current.volumeM3 += row.volumeM3 * ratio
      current.palletShare += estimateLinePalletShare(row) * ratio
      current.lengthCm = (current.lengthCm ?? 0) + dimensions.lengthCm * dimensionWeight
      current.widthCm = (current.widthCm ?? 0) + dimensions.widthCm * dimensionWeight
      current.heightCm = (current.heightCm ?? 0) + dimensions.heightCm * dimensionWeight
      current.dimensionWeight += dimensionWeight
      if (current.orientation === 'unknown' && dimensions.orientation !== 'unknown') {
        current.orientation = dimensions.orientation
      }
      current.dimensionSources = addUnique(current.dimensionSources, dimensions.dimensionSource)
      current.materialBreakdown = mergeMaterialBreakdown(current.materialBreakdown, [{
        material,
        quantity,
      }])
      current.materialCodes = addUnique(current.materialCodes, material)
      current.products = addUnique(current.products, catalogItem?.product || row.product)
      current.rowCount += 1
      groups.set(key, current)
    }
  }

  return [...groups.values()]
    .map(({ dimensionSources, dimensionWeight, rowCount, ...piece }) => ({
      ...piece,
      lengthCm: dimensionWeight > 0 ? roundTwo((piece.lengthCm ?? 0) / dimensionWeight) : 0,
      widthCm: dimensionWeight > 0 ? roundTwo((piece.widthCm ?? 0) / dimensionWeight) : 0,
      heightCm: dimensionWeight > 0 ? roundTwo((piece.heightCm ?? 0) / dimensionWeight) : 0,
      dimensionSource: compactSources(dimensionSources),
      materialCodes: piece.materialCodes.slice(0, 5),
      products: piece.products.slice(0, 4),
      palletShare: roundFour(Math.max(piece.palletShare, MIN_PACKING_SHARE * rowCount)),
      weightKg: roundOne(piece.weightKg),
      volumeM3: roundFour(piece.volumeM3),
      quantity: roundTwo(piece.quantity),
    }))
    .sort((a, b) => {
      const ruleA = materialRuleFor(a.productType)
      const ruleB = materialRuleFor(b.productType)
      return ruleA.stackRank - ruleB.stackRank || b.weightKg - a.weightKg
    })
}

function hasDirectDimensions(row: MasterLoadRow) {
  return Boolean(
    row.dimensionSource?.includes('directas') &&
      row.lengthCm &&
      row.widthCm &&
      row.heightCm,
  )
}

function dimensionsForMaterial(
  row: MasterLoadRow,
  material: string,
  productType: string,
): PieceDimensions {
  const catalogItem = PRODUCT_SIZE_BY_MATERIAL.get(material)
  if (catalogItem && hasCatalogDimensions(catalogItem)) {
    return {
      lengthCm: catalogItem.lengthCm,
      widthCm: catalogItem.widthCm,
      heightCm: catalogItem.heightCm,
      orientation: catalogItem.orientation === 'unknown'
        ? orientationForDimensions(catalogItem.lengthCm, catalogItem.widthCm, catalogItem.heightCm)
        : catalogItem.orientation,
      dimensionSource: catalogItem.dimensionSource || 'ZM040 dimensiones directas',
    }
  }

  if (hasDirectDimensions(row)) {
    const lengthCm = Number(row.lengthCm)
    const widthCm = Number(row.widthCm)
    const heightCm = Number(row.heightCm)
    return {
      lengthCm,
      widthCm,
      heightCm,
      orientation: row.orientation ?? orientationForDimensions(lengthCm, widthCm, heightCm),
      dimensionSource: row.dimensionSource ?? 'ZM040 dimensiones directas',
    }
  }

  return estimatedDimensionsFor(row, material, productType)
}

function hasCatalogDimensions(item: ProductSizeCatalogItem) {
  return Boolean(
    item.dimensionSource.includes('directas') &&
      item.lengthCm > 0 &&
      item.widthCm > 0 &&
      item.heightCm > 0,
  )
}

function buildProductSizeLookup(items: readonly ProductSizeCatalogItem[]) {
  const lookup = new Map<string, ProductSizeCatalogItem>()
  for (const item of items) {
    if (!item.material) {
      continue
    }
    const current = lookup.get(item.material)
    if (!current || productSizeScore(item) > productSizeScore(current)) {
      lookup.set(item.material, item)
    }
  }
  return lookup
}

function productSizeScore(item: ProductSizeCatalogItem) {
  if (hasCatalogDimensions(item)) {
    return 3
  }
  if (item.lengthCm > 0 && item.widthCm > 0 && item.heightCm > 0) {
    return 2
  }
  if (item.product) {
    return 1
  }
  return 0
}

function estimatedDimensionsFor(
  row: MasterLoadRow,
  material: string,
  productType: string,
): PieceDimensions {
  const text = `${row.product} ${material}`.toUpperCase()
  if (productType === 'barril') {
    if (text.includes('20')) {
      return estimatedDimensions(23.7, 23.7, 56, 'vertical', 'dimensiones estimadas barril 20L')
    }
    return estimatedDimensions(40.8, 40.8, 36.5, 'horizontal', 'dimensiones estimadas barril 30L')
  }
  if (productType === 'lata') {
    return estimatedDimensions(40, 27, 12, 'horizontal', 'dimensiones estimadas pack de latas')
  }
  if (productType === 'retornable') {
    return estimatedDimensions(40, 30, 29, 'horizontal', 'dimensiones estimadas caja retornable')
  }
  if (text.includes('SILLA')) {
    return estimatedDimensions(45, 45, 75, 'vertical', 'dimensiones estimadas PLV')
  }
  if (text.includes('PIZARRA') || text.includes('EXPOSITOR') || text.includes('NEVERA')) {
    return estimatedDimensions(80, 55, 120, 'vertical', 'dimensiones estimadas PLV')
  }
  if (text.includes('BOT') || text.includes('75CL') || text.includes('VERMUT') || text.includes('VINO')) {
    return estimatedDimensions(8, 8, 30, 'vertical', 'dimensiones estimadas botella')
  }
  if (text.includes('SERVIL') || text.includes('MANTEL') || text.includes('FILM') || text.includes('BOLSA')) {
    return estimatedDimensions(30, 20, 8, 'horizontal', 'dimensiones estimadas plano')
  }
  if (productType === 'caja') {
    return estimatedDimensions(40, 30, 25, 'horizontal', 'dimensiones estimadas caja')
  }
  return estimatedDimensions(30, 22, 18, 'horizontal', 'dimensiones estimadas por tipo')
}

function estimatedDimensions(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  orientation: ProductOrientation,
  dimensionSource: string,
): PieceDimensions {
  return {
    lengthCm,
    widthCm,
    heightCm,
    orientation,
    dimensionSource,
  }
}

function orientationForDimensions(lengthCm: number, widthCm: number, heightCm: number): ProductOrientation {
  if (lengthCm <= 0 || widthCm <= 0 || heightCm <= 0) {
    return 'unknown'
  }
  return heightCm > Math.max(lengthCm, widthCm) * 1.02 ? 'vertical' : 'horizontal'
}

function pieceGroupKey(productType: string, material: string, dimensions: PieceDimensions) {
  return [
    productType || 'otros',
    material || 'sin-material',
    dimensions.orientation,
    roundOne(dimensions.lengthCm),
    roundOne(dimensions.widthCm),
    roundOne(dimensions.heightCm),
  ].join('|')
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'pieza'
}

function compactSources(values: readonly string[]) {
  const counts = new Map<string, number>()
  for (const value of values) {
    if (!value) {
      continue
    }
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([source, count]) => (count > 1 ? `${source}: ${count}` : source))
    .join(', ')
}

function estimateLinePalletShare(row: MasterLoadRow) {
  const byPallet = Math.max(0, row.pallets)
  const byVolume = Math.max(0, row.volumeM3) / PALLET_VOLUME_LIMIT_M3
  const byWeight = Math.max(0, row.weightKg) / PALLET_WEIGHT_LIMIT_KG
  const byReturnable = row.returnable ? Math.max(0, row.quantity) * 0.0035 : 0
  const fallback = row.weightKg <= 0 && row.volumeM3 <= 0 ? MIN_PACKING_SHARE : 0
  return Math.max(byPallet, byVolume, byWeight, byReturnable, fallback)
}

function canMixClient(current: PalletDraft, client: ClientLoadInput, clientShare: number) {
  const clients = uniqueClients(current.pieces)
  if (clients.length === 0 || clients.some((item) => item.clientId === client.clientId)) {
    return true
  }

  const minStop = Math.min(...clients.map((item) => item.stop), client.optimizedSequence)
  const maxStop = Math.max(...clients.map((item) => item.stop), client.optimizedSequence)
  if (clients.length >= MAX_STOPS_PER_PALLET || maxStop - minStop > MAX_STOP_SPAN_PER_PALLET) {
    return false
  }

  if (current.usedPallets > 0.72 && clientShare > 0.14) {
    return false
  }

  if (current.weightKg > PALLET_WEIGHT_LIMIT_KG * 0.72 && client.weightKg > 120) {
    return false
  }

  return true
}

function canFitAnything(current: PalletDraft, piece: PieceDraft) {
  return fitPortion(current, piece) > 0.0001
}

function fitPortion(current: PalletDraft, piece: PieceDraft) {
  const shareRoom = PALLET_SHARE_LIMIT - current.usedPallets
  const weightRoom = PALLET_WEIGHT_LIMIT_KG - current.weightKg
  const volumeRoom = PALLET_VOLUME_LIMIT_M3 - current.volumeM3
  if (shareRoom <= 0 || weightRoom <= 0 || volumeRoom <= 0) {
    return 0
  }

  const shareByWeight = piece.weightKg > 0 ? weightRoom / (piece.weightKg / piece.palletShare) : Number.POSITIVE_INFINITY
  const shareByVolume = piece.volumeM3 > 0 ? volumeRoom / (piece.volumeM3 / piece.palletShare) : Number.POSITIVE_INFINITY
  return Math.max(0, Math.min(piece.palletShare, shareRoom, shareByWeight, shareByVolume))
}

function createPalletDraft(): PalletDraft {
  return {
    pieces: [],
    usedPallets: 0,
    weightKg: 0,
    volumeM3: 0,
    warnings: [],
  }
}

function addPiece(
  current: PalletDraft,
  piece: PieceDraft,
  palletShare: number,
  weightKg: number,
  volumeM3: number,
  quantity: number,
  splitIndex: number,
) {
  current.pieces.push({
    ...piece,
    id: `${piece.baseId}-${splitIndex}`,
    materialBreakdown: scaleMaterialBreakdown(
      piece.materialBreakdown,
      piece.quantity > 0 ? quantity / piece.quantity : palletShare / Math.max(piece.palletShare, 0.0001),
    ),
    palletShare: roundFour(palletShare),
    weightKg: roundOne(weightKg),
    volumeM3: roundFour(volumeM3),
    quantity: roundTwo(quantity),
  })
  current.usedPallets = roundFour(current.usedPallets + palletShare)
  current.weightKg = roundOne(current.weightKg + weightKg)
  current.volumeM3 = roundFour(current.volumeM3 + volumeM3)
  return current
}

function forceAddPiece(
  current: PalletDraft,
  piece: PieceDraft,
  palletShare: number,
  weightKg: number,
  volumeM3: number,
  quantity: number,
  splitIndex: number,
) {
  current = addPiece(current, piece, palletShare, weightKg, volumeM3, quantity, splitIndex)
  if (current.usedPallets > PALLET_SHARE_LIMIT) {
    current.warnings.push('Palet por encima de ocupación recomendada')
  }
  if (current.weightKg > PALLET_WEIGHT_LIMIT_KG) {
    current.warnings.push('Palet por encima de peso recomendado')
  }
  return current
}

function buildTruckSlots(
  occupiedDrafts: readonly PalletDraft[],
  truckSlots: number,
  reservedSlots: number,
) {
  const pallets: TruckPallet[] = []
  const reservedStartIndex = Math.max(0, truckSlots - reservedSlots)
  for (let index = 0; index < truckSlots; index += 1) {
    const draft = occupiedDrafts[index] ?? createPalletDraft()
    const row = Math.floor(index / 2)
    const lane = index % 2 === 0 ? 'left' : 'right'
    const clients = uniqueClients(draft.pieces)
    const stops = clients.map((client) => client.stop)
    const stopRange = stops.length > 0 ? ([Math.min(...stops), Math.max(...stops)] as const) : null
    const isEmpty = draft.pieces.length === 0
    const reservedForReturnables = isEmpty && index >= reservedStartIndex

    pallets.push({
      id: `P${index + 1}`,
      index,
      slotNumber: index + 1,
      row,
      lane,
      positionLabel: positionLabel(row, truckSlots),
      accessLabel: stopRange ? stopRangeLabel(stopRange) : reservedForReturnables ? 'Reserva retornables' : 'Reserva',
      clients,
      pieces: draft.pieces,
      usedPallets: roundTwo(draft.usedPallets),
      utilization: roundOne((draft.usedPallets / PALLET_SHARE_LIMIT) * 100),
      weightKg: roundOne(draft.weightKg),
      volumeM3: roundTwo(draft.volumeM3),
      stopRange,
      isEmpty,
      reservedForReturnables,
      warnings: draft.warnings,
    })
  }
  return pallets
}

function uniqueClients(pieces: readonly LoadPiece[]): PalletClient[] {
  const byClient = new Map<string, PalletClient>()
  for (const piece of pieces) {
    if (!byClient.has(piece.clientId)) {
      byClient.set(piece.clientId, {
        clientId: piece.clientId,
        name: piece.clientName,
        stop: piece.stop,
      })
    }
  }
  return [...byClient.values()].sort((a, b) => a.stop - b.stop)
}

function positionLabel(row: number, truckSlots: number) {
  const lastRow = Math.ceil(truckSlots / 2) - 1
  if (row === 0) {
    return 'Puerta trasera'
  }
  if (row === lastRow) {
    return 'Frontal'
  }
  return 'Centro'
}

function stopRangeLabel(stopRange: readonly [number, number]) {
  return stopRange[0] === stopRange[1] ? `Stop ${stopRange[0]}` : `Stops ${stopRange[0]}-${stopRange[1]}`
}

function materialBreakdownForRow(row: MasterLoadRow): readonly MaterialBreakdownItem[] {
  const breakdown = row.materialBreakdown?.filter((item) => item.material) ?? []
  if (breakdown.length > 0) {
    return breakdown.map((item) => ({
      material: item.material,
      quantity: roundTwo(item.quantity),
    }))
  }

  return row.material
    ? [{
        material: row.material,
        quantity: roundTwo(row.quantity),
      }]
    : []
}

function mergeMaterialBreakdown(
  current: readonly MaterialBreakdownItem[],
  additions: readonly MaterialBreakdownItem[],
): readonly MaterialBreakdownItem[] {
  const totals = new Map<string, number>()
  for (const item of [...current, ...additions]) {
    totals.set(item.material, roundTwo((totals.get(item.material) ?? 0) + item.quantity))
  }
  return [...totals.entries()].map(([material, quantity]) => ({ material, quantity }))
}

function scaleMaterialBreakdown(
  breakdown: readonly MaterialBreakdownItem[],
  ratio: number,
): readonly MaterialBreakdownItem[] {
  const safeRatio = Number.isFinite(ratio) ? Math.max(0, ratio) : 0
  return breakdown.map((item) => ({
    material: item.material,
    quantity: roundTwo(item.quantity * safeRatio),
  }))
}

function addUnique(values: readonly string[], value: string) {
  if (!value || values.includes(value)) {
    return values
  }
  return [...values, value]
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10
}

function roundTwo(value: number) {
  return Math.round(value * 100) / 100
}

function roundFour(value: number) {
  return Math.round(value * 10000) / 10000
}
