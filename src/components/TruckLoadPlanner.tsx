import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { LoadPiece, TruckLoadPlan, TruckPallet } from '@/utils/loadPlanner'
import { materialRuleFor } from '@/utils/loadPlanner'

type TruckLoadPlannerProps = {
  plan: TruckLoadPlan
  onSelectClient: (clientId: string) => void
}

type VisualUnit = LoadPiece & {
  visualId: string
  visualShare: number
}

const numberFormatter = new Intl.NumberFormat('es-ES')
const decimalFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })

export function TruckLoadPlanner({ plan, onSelectClient }: TruckLoadPlannerProps) {
  const firstOccupiedPallet = useMemo(
    () => plan.pallets.find((pallet) => !pallet.isEmpty) ?? plan.pallets[0],
    [plan.pallets],
  )
  const [selectedPalletId, setSelectedPalletId] = useState(firstOccupiedPallet.id)
  const selectedPallet =
    plan.pallets.find((pallet) => pallet.id === selectedPalletId) ?? firstOccupiedPallet

  function handleSelectPallet(pallet: TruckPallet) {
    setSelectedPalletId(pallet.id)
    const firstClient = pallet.clients[0]
    if (firstClient) {
      onSelectClient(firstClient.clientId)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-medium text-ink">Camión visual</h2>
          <p className="mt-1 text-sm text-muted">
            {plan.summary.occupiedPallets}/{plan.summary.totalSlots} palets ocupados ·{' '}
            {decimalFormatter.format(plan.summary.utilization)} % de capacidad · balance{' '}
            {formatKg(plan.summary.leftWeightKg)} / {formatKg(plan.summary.rightWeightKg)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.materialLegend.map((material) => (
            <span
              className="inline-flex items-center gap-1.5 rounded-md border border-cream-300 bg-cream-100 px-2 py-1 text-xs font-medium text-ink"
              key={material.type}
            >
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: material.color }}
              />
              {material.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div>
          <div className="grid gap-2 rounded-md border border-cream-300 bg-cream-100/50 p-3">
            <p className="text-center text-xs font-medium uppercase tracking-wide text-muted">
              Frontal
            </p>
            <div className="grid grid-cols-2 gap-2">
              {plan.pallets
                .slice()
                .reverse()
                .map((pallet) => (
                  <PalletSlotButton
                    isSelected={pallet.id === selectedPallet.id}
                    key={pallet.id}
                    onSelect={() => handleSelectPallet(pallet)}
                    pallet={pallet}
                  />
                ))}
            </div>
            <p className="text-center text-xs font-medium uppercase tracking-wide text-red-600">
              Puerta trasera
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <LoadMetric label="Palets eq." value={formatPallets(plan.summary.usedPallets)} />
            <LoadMetric label="Peso" value={formatKg(plan.summary.weightKg)} />
            <LoadMetric label="Volumen" value={formatM3(plan.summary.volumeM3)} />
            <LoadMetric
              label="Límite/palet"
              value={`${formatKg(plan.constraints.palletWeightKg)}`}
            />
          </div>
        </div>

        <div className="min-w-0">
          <PalletThreeScene pallet={selectedPallet} />
          <SelectedPalletDetails pallet={selectedPallet} />
        </div>
      </div>
    </div>
  )
}

function PalletSlotButton({
  pallet,
  isSelected,
  onSelect,
}: {
  pallet: TruckPallet
  isSelected: boolean
  onSelect: () => void
}) {
  const lane = pallet.lane === 'left' ? 'Izq.' : 'Der.'
  const baseClass = pallet.isEmpty
    ? 'border-cream-200 bg-cream-50/70 text-muted'
    : 'border-cream-300 bg-cream-50 text-ink hover:border-red-200 hover:bg-red-50/50'
  const selectedClass = isSelected ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : baseClass

  return (
    <button
      aria-label={`${pallet.id} ${pallet.accessLabel}`}
      aria-pressed={isSelected}
      className={`min-h-28 rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${selectedClass}`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{pallet.id}</span>
        <span className="rounded-md border border-cream-300 bg-cream-50 px-2 py-0.5 text-[11px] font-medium text-muted">
          {lane}
        </span>
      </div>
      <p className="mt-1 text-xs font-medium text-muted">{pallet.accessLabel}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream-200">
        <span
          className="block h-full rounded-full bg-red-600"
          style={{ width: `${Math.min(100, pallet.utilization)}%` }}
        />
      </div>
      <div className="mt-3 space-y-1">
        {pallet.clients.slice(0, 2).map((client) => (
          <p className="truncate text-xs font-medium" key={client.clientId} title={client.name}>
            {client.stop}. {client.name}
          </p>
        ))}
        {pallet.clients.length > 2 ? (
          <p className="text-xs text-muted">+{pallet.clients.length - 2} paradas</p>
        ) : null}
        {pallet.isEmpty ? <p className="text-xs text-muted">Libre</p> : null}
      </div>
      <p className="mt-3 text-xs text-muted">
        {formatPallets(pallet.usedPallets)} pal · {formatKg(pallet.weightKg)}
      </p>
    </button>
  )
}

function PalletThreeScene({ pallet }: { pallet: TruckPallet }) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#FFFBF7')

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(1.85, 1.35, 1.85)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.setAttribute('aria-label', `Vista 3D del ${pallet.id}`)
    renderer.domElement.setAttribute('role', 'img')
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 1.4
    controls.maxDistance = 3.2
    controls.target.set(0, 0.38, 0)

    scene.add(new THREE.HemisphereLight('#ffffff', '#e8ddd0', 2.4))
    const keyLight = new THREE.DirectionalLight('#ffffff', 2.2)
    keyLight.position.set(2.5, 3, 2)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight('#fff2e5', 1.2)
    fillLight.position.set(-2, 1.4, -1.5)
    scene.add(fillLight)

    const content = createPalletSceneContent(pallet)
    scene.add(content)

    const resize = () => {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      renderer.render(scene, camera)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()

    let frameId = 0
    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.cancelAnimationFrame(frameId)
      observer.disconnect()
      controls.dispose()
      disposeObject(scene)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [pallet])

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-md bg-cream-100" ref={containerRef}>
      {pallet.isEmpty ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 text-center text-sm font-medium text-muted">
          Palet libre
        </div>
      ) : null}
    </div>
  )
}

function SelectedPalletDetails({ pallet }: { pallet: TruckPallet }) {
  const piecesByType = useMemo(() => {
    const groups = new Map<string, { label: string; color: string; weightKg: number; palletShare: number }>()
    for (const piece of pallet.pieces) {
      const rule = materialRuleFor(piece.productType)
      const current = groups.get(piece.productType) ?? {
        label: rule.label,
        color: rule.color,
        weightKg: 0,
        palletShare: 0,
      }
      current.weightKg += piece.weightKg
      current.palletShare += piece.palletShare
      groups.set(piece.productType, current)
    }
    return [...groups.values()].sort((a, b) => b.palletShare - a.palletShare)
  }, [pallet.pieces])

  return (
    <div className="mt-4 grid gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Palet seleccionado</p>
        <h3 className="mt-1 text-lg font-semibold text-ink">
          {pallet.id} · {pallet.positionLabel}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {pallet.accessLabel} · {formatPallets(pallet.usedPallets)} palets ·{' '}
          {formatKg(pallet.weightKg)}
        </p>
        <div className="mt-3 space-y-1.5">
          {pallet.clients.map((client) => (
            <p className="truncate text-sm font-medium text-ink" key={client.clientId}>
              {client.stop}. {client.name}
            </p>
          ))}
          {pallet.clients.length === 0 ? <p className="text-sm text-muted">Reserva libre</p> : null}
        </div>
      </div>

      <div className="grid gap-2">
        {piecesByType.map((piece) => (
          <div className="rounded-md border border-cream-200 bg-cream-100/50 p-3" key={piece.label}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: piece.color }} />
              <span className="text-sm font-medium text-ink">{piece.label}</span>
            </div>
            <p className="mt-2 text-xs text-muted">
              {formatPallets(piece.palletShare)} pal · {formatKg(piece.weightKg)}
            </p>
          </div>
        ))}
        {pallet.warnings.map((warning) => (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700" key={warning}>
            {warning}
          </div>
        ))}
      </div>
    </div>
  )
}

function LoadMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-cream-200 bg-cream-100/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold text-ink">{value}</p>
    </div>
  )
}

function createPalletSceneContent(pallet: TruckPallet) {
  const group = new THREE.Group()
  group.add(createPalletBase())

  const units = expandVisualUnits(pallet.pieces)
  const cellHeights = Array.from({ length: 12 }, () => 0)
  const cellPositions = buildCellPositions()
  const sortedUnits = units.sort((a, b) => {
    const ruleA = materialRuleFor(a.productType)
    const ruleB = materialRuleFor(b.productType)
    return ruleA.stackRank - ruleB.stackRank || a.stop - b.stop
  })

  for (const unit of sortedUnits) {
    const cellIndex = chooseCell(cellHeights)
    const position = cellPositions[cellIndex]
    const size = unitSize(unit)
    const baseY = 0.1 + cellHeights[cellIndex]
    const mesh = createLoadMesh(unit, size)
    mesh.position.set(position.x, baseY + size.height / 2, position.z)
    cellHeights[cellIndex] += size.height + 0.014
    group.add(mesh)
  }

  group.rotation.y = -0.48
  return group
}

function createPalletBase() {
  const group = new THREE.Group()
  const wood = new THREE.MeshStandardMaterial({ color: '#B88755', roughness: 0.72 })
  const darkWood = new THREE.MeshStandardMaterial({ color: '#7A5132', roughness: 0.8 })

  for (const z of [-0.34, -0.17, 0, 0.17, 0.34]) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.045, 0.075), wood)
    board.position.set(0, 0.065, z)
    group.add(board)
  }

  for (const x of [-0.46, 0, 0.46]) {
    const support = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.82), darkWood)
    support.position.set(x, 0.015, 0)
    group.add(support)
  }

  return group
}

function createLoadMesh(unit: VisualUnit, size: { width: number; depth: number; height: number }) {
  const material = new THREE.MeshStandardMaterial({
    color: unit.color,
    metalness: unit.productType === 'lata' ? 0.22 : 0.04,
    roughness: unit.productType === 'lata' ? 0.42 : 0.68,
  })
  const edgeMaterial = new THREE.LineBasicMaterial({ color: '#3A2B25', transparent: true, opacity: 0.35 })

  if (unit.shape === 'cylinder') {
    const radius = Math.min(size.width, size.depth) / 2
    const geometry = new THREE.CylinderGeometry(radius, radius, size.height, 28)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMaterial))
    return mesh
  }

  const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMaterial))

  if (unit.shape === 'crate') {
    const crateLine = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(size.width * 1.03, size.height * 1.03, size.depth * 1.03)),
      new THREE.LineBasicMaterial({ color: '#174F34', transparent: true, opacity: 0.65 }),
    )
    mesh.add(crateLine)
  }

  return mesh
}

function expandVisualUnits(pieces: readonly LoadPiece[]) {
  const units: VisualUnit[] = []
  for (const piece of pieces) {
    const count = Math.min(6, Math.max(1, Math.ceil(piece.palletShare / 0.13)))
    for (let index = 0; index < count; index += 1) {
      units.push({
        ...piece,
        visualId: `${piece.id}-${index}`,
        visualShare: piece.palletShare / count,
      })
    }
  }
  return units.slice(0, 42)
}

function buildCellPositions() {
  const positions: { x: number; z: number }[] = []
  for (let zIndex = 0; zIndex < 3; zIndex += 1) {
    for (let xIndex = 0; xIndex < 4; xIndex += 1) {
      positions.push({
        x: -0.45 + xIndex * 0.3,
        z: 0.27 - zIndex * 0.27,
      })
    }
  }
  return positions
}

function chooseCell(cellHeights: readonly number[]) {
  let bestIndex = 0
  let bestHeight = cellHeights[0]
  for (let index = 1; index < cellHeights.length; index += 1) {
    if (cellHeights[index] < bestHeight) {
      bestHeight = cellHeights[index]
      bestIndex = index
    }
  }
  return bestIndex
}

function unitSize(unit: VisualUnit) {
  const share = clamp(unit.visualShare, 0.018, 0.22)
  const scale = Math.sqrt(share / 0.1)

  if (unit.shape === 'cylinder') {
    const radius = clamp(scale * (unit.productType === 'barril' ? 0.105 : 0.075), 0.055, 0.145)
    return {
      width: radius * 2,
      depth: radius * 2,
      height: clamp(0.18 + share * 1.15, 0.16, 0.46),
    }
  }

  return {
    width: clamp(0.18 + scale * 0.12, 0.18, 0.3),
    depth: clamp(0.14 + scale * 0.1, 0.14, 0.26),
    height: clamp(0.14 + share * 1.4, 0.14, unit.shape === 'crate' ? 0.34 : 0.42),
  }
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
      child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose())
      } else {
        child.material.dispose()
      }
    }
  })
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function formatKg(value: number) {
  return `${numberFormatter.format(Math.round(value))} kg`
}

function formatM3(value: number) {
  return `${decimalFormatter.format(value)} m³`
}

function formatPallets(value: number) {
  if (value > 0 && value < 0.05) {
    return '<0,1'
  }
  return decimalFormatter.format(value)
}
