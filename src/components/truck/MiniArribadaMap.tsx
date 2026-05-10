import L from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

type Props = {
  /** Coordenades del punt d’entrega (parada de la ruta). */
  destiLat: number
  destiLng: number
  /** Índex de parada a la ruta (0-based), mateixa numeració que el mapa principal. */
  indexParadaRuta: number
  className?: string
}

function iconDesti(indexRuta0: number): L.DivIcon {
  const html = `<div style="width:36px;height:36px;border-radius:50%;background:#ea580c;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#fff;font:700 13px ui-sans-serif,system-ui,sans-serif">${indexRuta0 + 1}</div>`
  return L.divIcon({
    className: 'leaflet-mini-arribada-desti',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

function FitBoth({
  a,
  b,
}: {
  a: [number, number]
  b: [number, number] | null
}) {
  const map = useMap()
  const alat = a[0]
  const alng = a[1]
  const blat = b?.[0]
  const blng = b?.[1]
  useEffect(() => {
    if (blat !== undefined && blng !== undefined) {
      const bounds = L.latLngBounds([
        [alat, alng],
        [blat, blng],
      ])
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 17, animate: false })
    } else {
      map.setView([alat, alng], 16, { animate: false })
    }
  }, [map, alat, alng, blat, blng])
  return null
}

/**
 * Mapa OSM compacte: destinació + posició GPS del dispositiu (si es permet).
 */
export function MiniArribadaMap({ destiLat, destiLng, indexParadaRuta, className }: Props) {
  const desti: [number, number] = useMemo(() => [destiLat, destiLng], [destiLat, destiLng])
  const [usuari, setUsuari] = useState<[number, number] | null>(null)
  const [geoMsg, setGeoMsg] = useState<string | null>(() =>
    typeof navigator !== 'undefined' && !navigator.geolocation
      ? 'Geolocalització no disponible en aquest dispositiu.'
      : null,
  )

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUsuari([pos.coords.latitude, pos.coords.longitude])
        setGeoMsg(null)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoMsg('Permís de ubicació denegat: es mostra només el destí.')
        } else {
          setGeoMsg('No s’ha pogut obtenir la teva posició.')
        }
      },
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 12000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  const destIcon = useMemo(() => iconDesti(indexParadaRuta), [indexParadaRuta])

  return (
    <div className={className ?? ''}>
      <div className="relative h-[min(42vw,220px)] w-full min-h-[168px] overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
        <MapContainer
          center={desti}
          className="z-0 h-full w-full"
          scrollWheelZoom={false}
          zoom={16}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBoth a={desti} b={usuari} />
          <Marker icon={destIcon} position={desti} />
          {usuari ? (
            <>
              <CircleMarker
                center={usuari}
                pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.35, weight: 2 }}
                radius={9}
              />
              <CircleMarker
                center={usuari}
                pathOptions={{ color: '#1d4ed8', fillColor: '#1d4ed8', fillOpacity: 0.95, weight: 1 }}
                radius={5}
              />
            </>
          ) : null}
        </MapContainer>
      </div>
      <p className="mt-2 text-xs leading-snug text-slate-600">
        <span className="font-semibold text-slate-800">Destí</span> (taronja){' '}
        {usuari ? (
          <>
            · <span className="font-semibold text-slate-800">Tu</span> (blau)
          </>
        ) : null}
      </p>
      {geoMsg ? <p className="mt-1 text-xs text-amber-800">{geoMsg}</p> : null}
    </div>
  )
}
