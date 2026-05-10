import { setExcelRutesLiniesPerRuta } from '@/data/excelRutesLiniesRegistry'
import type { Camio } from '@/models/Camio'

import { assignarRutesACamionsDesExcel, type ResultatAssignacio } from './assignacioRutes'
import { carregarRutesILiniesDesExcel, type ExcelRutesDocument } from './excelRutesFleet'

/**
 * Carrega el document de rutes (Excel → JSON): URL explícita, després `public/excel-rutes.json`,
 * després el JSON empaquetat a `src/data/excel-rutes.json`.
 */
export async function carregarDocumentRutesFleet(): Promise<ExcelRutesDocument> {
  const urls: string[] = []
  const envUrl = import.meta.env.VITE_FLEET_RUTES_URL?.trim()
  if (envUrl) urls.push(envUrl)

  const baseRaw = import.meta.env.BASE_URL ?? '/'
  const base = baseRaw.endsWith('/') ? baseRaw : `${baseRaw}/`
  urls.push(`${base}excel-rutes.json`)

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        return (await res.json()) as ExcelRutesDocument
      }
    } catch {
      /* prova següent */
    }
  }

  const bundled = await import('@/data/excel-rutes.json')
  return bundled.default as unknown as ExcelRutesDocument
}

/**
 * Aplica el document al registre de línies i assigna cada ruta al camió (id Excel, àlies o tipus).
 */
export async function inicialitzarFlotaDesExcel(camions: Camio[]): Promise<ResultatAssignacio> {
  const doc = await carregarDocumentRutesFleet()
  const { rutes, liniesPerRutaId, codiCamioExcelPerRutaId } = carregarRutesILiniesDesExcel(doc)
  setExcelRutesLiniesPerRuta(liniesPerRutaId)
  return assignarRutesACamionsDesExcel(camions, rutes, codiCamioExcelPerRutaId)
}
