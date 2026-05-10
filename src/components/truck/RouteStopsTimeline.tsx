import type { ParadaRuta } from '@/models/Ruta'
import { cn } from '@/utils/cn'
import { esParadaMagatzem } from '@/utils/paradaMap'
import { timelineThickHeightPx } from '@/utils/routePathDrive'

type Props = {
  parades: readonly ParadaRuta[]
  stopDistances: number[] | null
  totalPathMeters: number | null
  distanceAlong: number
  completedDeliveryIndices: ReadonlySet<number>
  /** Entrega saltada (no s’ha pogut baixar mercaderia); la simulació ha reconegut la parada. */
  skippedDeliveryIndices?: ReadonlySet<number>
}

/** Alçada fixa de cada fila: el centre del node coincideix amb el salt de la línia vertical. */
export const TIMELINE_ROW_HEIGHT_PX = 88

const CAP_SKIPPED_BUIT: ReadonlySet<number> = new Set()

/**
 * Línia vertical contínua amb nodes; el tram gruixut segueix la distància recorreguda al llarg de la ruta real.
 */
export function RouteStopsTimeline({
  parades,
  stopDistances,
  totalPathMeters,
  distanceAlong,
  completedDeliveryIndices,
  skippedDeliveryIndices,
}: Props) {
  const skipped = skippedDeliveryIndices ?? CAP_SKIPPED_BUIT
  const spineTopPx = TIMELINE_ROW_HEIGHT_PX / 2
  const spineHeightPx =
    parades.length > 1 ? (parades.length - 1) * TIMELINE_ROW_HEIGHT_PX : 0

  const d =
    totalPathMeters != null && totalPathMeters > 0
      ? Math.min(Math.max(0, distanceAlong), totalPathMeters)
      : 0

  const progressHeightPx =
    stopDistances && totalPathMeters != null && totalPathMeters > 0 && parades.length > 1
      ? timelineThickHeightPx(stopDistances, d, totalPathMeters, TIMELINE_ROW_HEIGHT_PX)
      : 0

  if (parades.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
        No hi ha parades per aquesta ruta.
      </p>
    )
  }

  const spineLeftPx = 20

  return (
    <ol className="relative list-none pl-0">
      {spineHeightPx > 0 ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-slate-200"
            style={{
              left: spineLeftPx,
              top: spineTopPx,
              width: 2,
              height: spineHeightPx,
              transform: 'translateX(-50%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-slate-900 transition-[height] duration-150 ease-linear"
            style={{
              left: spineLeftPx,
              top: spineTopPx,
              width: 6,
              height: progressHeightPx,
              maxHeight: spineHeightPx,
              transform: 'translateX(-50%)',
            }}
          />
        </>
      ) : null}

      {parades.map((parada, index) => {
        const magatzem = esParadaMagatzem(index, parades.length)
        const threshold = stopDistances?.[index]
        const nodeReached =
          threshold != null && totalPathMeters != null && d >= threshold - 0.5
        const deliverySkipped = !magatzem && skipped.has(index)
        const deliveryDone = !magatzem && completedDeliveryIndices.has(index)

        return (
          <li
            className="relative flex gap-3"
            data-stop-index={index}
            key={`${parada.nom}-${index}`}
            style={{ height: TIMELINE_ROW_HEIGHT_PX }}
          >
            <div className="relative z-[2] flex w-10 shrink-0 items-center justify-center">
              <div
                className={cn(
                  'shrink-0 rounded-full border-2 border-white shadow-sm transition-colors duration-200',
                  magatzem ? 'h-3 w-3' : 'h-2.5 w-2.5',
                  deliverySkipped
                    ? 'bg-amber-500 ring-2 ring-amber-400/40'
                    : deliveryDone
                      ? 'bg-emerald-600 ring-2 ring-emerald-500/30'
                      : nodeReached
                        ? 'bg-slate-900 ring-2 ring-slate-900/25'
                        : 'bg-white ring-2 ring-slate-300',
                )}
                title={
                  magatzem ? 'Magatzem' : deliverySkipped ? 'Entrega no realitzada' : 'Entrega'
                }
              />
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center py-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-xs font-semibold tabular-nums text-slate-600">
                  {parada.horaArribadaAprox}
                </span>
                <span className="line-clamp-2 text-sm font-medium leading-snug text-slate-900">
                  {parada.nom}
                </span>
              </div>
              {magatzem ? (
                <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Magatzem
                </span>
              ) : deliverySkipped ? (
                <span className="mt-0.5 block text-[11px] font-semibold text-amber-800">
                  Entrega no realitzada
                </span>
              ) : deliveryDone ? (
                <span className="mt-0.5 block text-[11px] font-semibold text-emerald-700">
                  Entrega completada
                </span>
              ) : (
                <span className="mt-0.5 block text-[11px] text-slate-500">Entrega</span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
