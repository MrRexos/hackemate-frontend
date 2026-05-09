import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { LoadPiece, TruckLoadPlan, TruckPallet } from '@/utils/loadPlanner'
import { materialRuleFor } from '@/utils/loadPlanner'

type TruckLoadPlannerProps = {
  plan: TruckLoadPlan
  onSelectClient: (clientId: string) => void
  selectedClientId?: string
  showFloorPlan?: boolean
}

type VisualUnit = LoadPiece & {
  visualId: string
  visualShare: number
}

const numberFormatter = new Intl.NumberFormat('es-ES')
const decimalFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })

export function TruckLoadPlanner({
  plan,
  onSelectClient,
  selectedClientId,
  showFloorPlan = false,
}: TruckLoadPlannerProps) {
  const firstOccupiedPallet = useMemo(
    () => plan.pallets.find((pallet) => !pallet.isEmpty) ?? plan.pallets[0],
    [plan.pallets],
  )
  const [selectedPalletId, setSelectedPalletId] = useState(firstOccupiedPallet.id)
  const selectedPallet =
    plan.pallets.find((pallet) => pallet.id === selectedPalletId) ?? firstOccupiedPallet

  const handleSelectPallet = useCallback((pallet: TruckPallet) => {
    setSelectedPalletId(pallet.id)
    const firstClient = pallet.clients[0]
    if (firstClient) {
      onSelectClient(firstClient.clientId)
    }
  }, [onSelectClient])

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#47392b]">Camión visual</h2>
          <p className="mt-1 text-sm font-medium text-[#806a54]">
            {plan.summary.occupiedPallets}/{plan.summary.totalSlots} palets ocupados ·{' '}
            {decimalFormatter.format(plan.summary.utilization)} % de capacidad · balance{' '}
            {formatKg(plan.summary.leftWeightKg)} / {formatKg(plan.summary.rightWeightKg)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.materialLegend.map((material) => (
            <span
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#f6e5d4] px-2.5 py-1 text-xs font-bold text-[#806a54]"
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

      {showFloorPlan ? (
        <TruckTopDownScene
          onSelectPallet={handleSelectPallet}
          plan={plan}
          selectedClientId={selectedClientId}
          selectedPalletId={selectedPallet.id}
        />
      ) : null}

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div>
          <div className="grid gap-2 rounded-[13px] bg-[#f6e5d4] p-3">
            <p className="text-center text-[11px] font-bold uppercase leading-none tracking-wide text-[#a99583]">
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
            <p className="text-center text-[11px] font-bold uppercase leading-none tracking-wide text-[#c53030]">
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

function TruckTopDownScene({
  onSelectPallet,
  plan,
  selectedClientId,
  selectedPalletId,
}: {
  onSelectPallet: (pallet: TruckPallet) => void
  plan: TruckLoadPlan
  selectedClientId?: string
  selectedPalletId: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const selectedPallet = plan.pallets.find((pallet) => pallet.id === selectedPalletId) ?? plan.pallets[0]

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    const containerElement = container

    const rowCount = Math.max(1, Math.ceil(plan.constraints.slots / 2))
    const slotPitch = 1.54
    const lanePitch = 0.94
    const truckLength = rowCount * slotPitch + 0.62
    const truckWidth = lanePitch + 1.08
    const rowOffset = ((rowCount - 1) * slotPitch) / 2
    const palletsById = new Map(plan.pallets.map((pallet) => [pallet.id, pallet]))

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#fdf9f6')

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50)
    camera.position.set(0, 8, 0)
    camera.up.set(0, 0, -1)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.setAttribute('aria-label', 'Vista superior de la planta del camión')
    renderer.domElement.setAttribute('role', 'img')
    renderer.domElement.style.cursor = 'pointer'
    container.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight('#ffffff', '#e8ddd0', 2.6))
    const topLight = new THREE.DirectionalLight('#ffffff', 2.8)
    topLight.position.set(0, 6, 0)
    scene.add(topLight)

    const floorMaterial = new THREE.MeshStandardMaterial({ color: '#f6e5d4', roughness: 0.78 })
    const railMaterial = new THREE.MeshStandardMaterial({ color: '#806a54', roughness: 0.62 })
    const cabMaterial = new THREE.MeshStandardMaterial({ color: '#d9c8b7', roughness: 0.58 })
    const glassMaterial = new THREE.MeshStandardMaterial({ color: '#8aa0aa', roughness: 0.35 })
    const dividerMaterial = new THREE.LineBasicMaterial({
      color: '#a99583',
      transparent: true,
      opacity: 0.55,
    })

    const floor = new THREE.Mesh(new THREE.BoxGeometry(truckLength, 0.05, truckWidth), floorMaterial)
    floor.position.y = -0.03
    scene.add(floor)

    const sideRailGeometry = new THREE.BoxGeometry(truckLength, 0.08, 0.035)
    for (const z of [-truckWidth / 2, truckWidth / 2]) {
      const rail = new THREE.Mesh(sideRailGeometry, railMaterial)
      rail.position.set(0, 0.03, z)
      scene.add(rail)
    }

    const rearRail = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.08, truckWidth), railMaterial)
    rearRail.position.set(-truckLength / 2, 0.03, 0)
    scene.add(rearRail)

    const frontRail = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.08, truckWidth), railMaterial)
    frontRail.position.set(truckLength / 2, 0.03, 0)
    scene.add(frontRail)

    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.08, truckWidth * 0.78), cabMaterial)
    cab.position.set(truckLength / 2 + 0.4, 0.01, 0)
    scene.add(cab)

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.09, truckWidth * 0.54), glassMaterial)
    windshield.position.set(truckLength / 2 + 0.18, 0.06, 0)
    scene.add(windshield)

    const laneDividerGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-truckLength / 2 + 0.16, 0.05, 0),
      new THREE.Vector3(truckLength / 2 - 0.16, 0.05, 0),
    ])
    scene.add(new THREE.Line(laneDividerGeometry, dividerMaterial))

    for (const pallet of plan.pallets) {
      const palletGroup = createPalletSceneContent(pallet, {
        rotate: false,
        selectedClientId,
      })
      const laneZ = pallet.lane === 'left' ? -lanePitch / 2 : lanePitch / 2
      palletGroup.position.set(pallet.row * slotPitch - rowOffset, 0.06, laneZ)
      palletGroup.scale.setScalar(0.88)
      tagPalletObjects(palletGroup, pallet.id)
      scene.add(palletGroup)

      if (pallet.id === selectedPalletId) {
        const frame = createSelectionFrame(1.34, 0.9)
        frame.position.set(palletGroup.position.x, 0.08, palletGroup.position.z)
        scene.add(frame)
      }
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    function render() {
      renderer.render(scene, camera)
    }

    function resize() {
      const width = Math.max(containerElement.clientWidth, 1)
      const height = Math.max(containerElement.clientHeight, 1)
      const aspect = width / height
      const baseWidth = truckLength + 1.32
      const baseHeight = truckWidth + 0.72
      let viewWidth = baseWidth
      let viewHeight = baseHeight

      if (viewWidth / viewHeight < aspect) {
        viewWidth = viewHeight * aspect
      } else {
        viewHeight = viewWidth / aspect
      }

      camera.left = -viewWidth / 2
      camera.right = viewWidth / 2
      camera.top = viewHeight / 2
      camera.bottom = -viewHeight / 2
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      render()
    }

    function handlePointerDown(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      const hit = raycaster
        .intersectObjects(scene.children, true)
        .find((intersection) => typeof intersection.object.userData.palletId === 'string')
      const palletId = hit?.object.userData.palletId
      const pallet = typeof palletId === 'string' ? palletsById.get(palletId) : undefined

      if (pallet) {
        onSelectPallet(pallet)
      }
    }

    const observer = new ResizeObserver(resize)
    observer.observe(containerElement)
    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    resize()

    return () => {
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      disposeObject(scene)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [onSelectPallet, plan, selectedClientId, selectedPalletId])

  return (
    <section className="mt-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#47392b]">Planta del camión</h3>
          <p className="mt-1 text-xs font-medium text-[#806a54]">
            Vista superior horizontal con los palets en su posición real y los productos por color.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#f6e5d4] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#806a54]">
          <span>Puerta trasera</span>
          <span className="h-px w-8 bg-[#c53030]" />
          <span>Frontal</span>
        </div>
      </div>
      <div className="relative min-h-[320px] overflow-hidden rounded-[13px] bg-[#fdf9f6] ring-1 ring-[#f1e5d9]">
        <div className="absolute inset-0" ref={containerRef} />
        <div className="pointer-events-none absolute left-3 top-3 rounded-[11px] bg-[#fdf9f6]/95 px-3 py-2 text-xs font-bold text-[#47392b] shadow-sm">
          Puerta trasera
        </div>
        <div className="pointer-events-none absolute right-3 top-3 rounded-[11px] bg-[#fdf9f6]/95 px-3 py-2 text-xs font-bold text-[#47392b] shadow-sm">
          Cabina
        </div>
        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-[13px] bg-[#fdf9f6]/95 px-3 py-2 shadow-sm">
          <p className="truncate text-xs font-bold text-[#47392b]">
            {selectedPallet.id} · {selectedPallet.positionLabel} ·{' '}
            {selectedPallet.isEmpty
              ? 'Palet libre'
              : selectedPallet.clients.map((client) => `${client.stop}. ${client.name}`).join(' / ')}
          </p>
          <p className="mt-1 text-[11px] font-medium text-[#806a54]">
            {formatPallets(selectedPallet.usedPallets)} pal · {formatKg(selectedPallet.weightKg)} ·{' '}
            {decimalFormatter.format(selectedPallet.utilization)} %
          </p>
        </div>
      </div>
    </section>
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
    ? 'bg-[#fdf9f6]/65 text-[#a99583]'
    : 'bg-[#fdf9f6] text-[#47392b] hover:bg-white'
  const selectedClass = isSelected ? 'bg-[#c53030] text-white ring-2 ring-[#c53030]/20' : baseClass

  return (
    <button
      aria-label={`${pallet.id} ${pallet.accessLabel}`}
      aria-pressed={isSelected}
      className={`min-h-28 rounded-[13px] p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c53030] ${selectedClass}`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold">{pallet.id}</span>
        <span
          className={`rounded-[10px] px-2 py-0.5 text-[11px] font-bold ${
            isSelected ? 'bg-white/20 text-white/80' : 'bg-[#f6e5d4] text-[#a99583]'
          }`}
        >
          {lane}
        </span>
      </div>
      <p className={`mt-1 text-xs font-bold ${isSelected ? 'text-white/75' : 'text-[#a99583]'}`}>{pallet.accessLabel}</p>
      <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${isSelected ? 'bg-white/25' : 'bg-[#f6e5d4]'}`}>
        <span
          className={`block h-full rounded-full ${isSelected ? 'bg-white' : 'bg-[#c53030]'}`}
          style={{ width: `${Math.min(100, pallet.utilization)}%` }}
        />
      </div>
      <div className="mt-3 space-y-1">
        {pallet.clients.slice(0, 2).map((client) => (
          <p className="truncate text-xs font-bold" key={client.clientId} title={client.name}>
            {client.stop}. {client.name}
          </p>
        ))}
        {pallet.clients.length > 2 ? (
          <p className={`text-xs font-medium ${isSelected ? 'text-white/75' : 'text-[#806a54]'}`}>+{pallet.clients.length - 2} paradas</p>
        ) : null}
        {pallet.isEmpty ? <p className={`text-xs font-medium ${isSelected ? 'text-white/75' : 'text-[#806a54]'}`}>Libre</p> : null}
      </div>
      <p className={`mt-3 text-xs font-medium ${isSelected ? 'text-white/75' : 'text-[#806a54]'}`}>
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
    scene.background = new THREE.Color('#fdf9f6')

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
    <div className="relative min-h-[360px] overflow-hidden rounded-[13px] bg-[#f6e5d4]" ref={containerRef}>
      {pallet.isEmpty ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 text-center text-sm font-bold text-[#806a54]">
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
        <p className="text-[11px] font-bold uppercase leading-none tracking-wide text-[#b8aa9c]">Palet seleccionado</p>
        <h3 className="mt-2 text-lg font-bold text-[#47392b]">
          {pallet.id} · {pallet.positionLabel}
        </h3>
        <p className="mt-2 text-sm font-medium text-[#806a54]">
          {pallet.accessLabel} · {formatPallets(pallet.usedPallets)} palets ·{' '}
          {formatKg(pallet.weightKg)}
        </p>
        <div className="mt-3 space-y-1.5">
          {pallet.clients.map((client) => (
            <p className="truncate text-sm font-bold text-[#47392b]" key={client.clientId}>
              {client.stop}. {client.name}
            </p>
          ))}
          {pallet.clients.length === 0 ? <p className="text-sm font-medium text-[#806a54]">Reserva libre</p> : null}
        </div>
      </div>

      <div className="grid gap-2">
        {piecesByType.map((piece) => (
          <div className="rounded-[13px] bg-[#f6e5d4] p-3" key={piece.label}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: piece.color }} />
              <span className="text-sm font-bold text-[#47392b]">{piece.label}</span>
            </div>
            <p className="mt-2 text-xs font-medium text-[#806a54]">
              {formatPallets(piece.palletShare)} pal · {formatKg(piece.weightKg)}
            </p>
          </div>
        ))}
        {pallet.warnings.map((warning) => (
          <div className="rounded-[13px] bg-[#f7d9cf] p-3 text-xs font-bold text-[#9b2c2c]" key={warning}>
            {warning}
          </div>
        ))}
      </div>
    </div>
  )
}

function LoadMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[13px] bg-[#f6e5d4] p-3">
      <p className="text-[11px] font-bold uppercase leading-none tracking-wide text-[#b8aa9c]">{label}</p>
      <p className="mt-2 text-base font-bold text-[#806a54]">{value}</p>
    </div>
  )
}

function createPalletSceneContent(
  pallet: TruckPallet,
  options: { rotate?: boolean; selectedClientId?: string } = {},
) {
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
    const mesh = createLoadMesh(unit, size, {
      dimmed: Boolean(options.selectedClientId && unit.clientId !== options.selectedClientId),
    })
    mesh.position.set(position.x, baseY + size.height / 2, position.z)
    cellHeights[cellIndex] += size.height + 0.014
    group.add(mesh)
  }

  if (options.rotate !== false) {
    group.rotation.y = -0.48
  }
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

function createLoadMesh(
  unit: VisualUnit,
  size: { width: number; depth: number; height: number },
  options: { dimmed?: boolean } = {},
) {
  const material = new THREE.MeshStandardMaterial({
    color: unit.color,
    metalness: unit.productType === 'lata' ? 0.22 : 0.04,
    opacity: options.dimmed ? 0.28 : 1,
    roughness: unit.productType === 'lata' ? 0.42 : 0.68,
    transparent: options.dimmed,
  })
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: '#3A2B25',
    transparent: true,
    opacity: options.dimmed ? 0.12 : 0.35,
  })

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

function createSelectionFrame(width: number, depth: number) {
  const group = new THREE.Group()
  const material = new THREE.MeshBasicMaterial({ color: '#c53030' })
  const horizontalGeometry = new THREE.BoxGeometry(width, 0.035, 0.035)
  const verticalGeometry = new THREE.BoxGeometry(0.035, 0.035, depth)

  for (const z of [-depth / 2, depth / 2]) {
    const line = new THREE.Mesh(horizontalGeometry, material)
    line.position.z = z
    group.add(line)
  }

  for (const x of [-width / 2, width / 2]) {
    const line = new THREE.Mesh(verticalGeometry, material)
    line.position.x = x
    group.add(line)
  }

  return group
}

function tagPalletObjects(group: THREE.Object3D, palletId: string) {
  group.userData.palletId = palletId
  group.traverse((child) => {
    child.userData.palletId = palletId
  })
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
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Line) {
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
