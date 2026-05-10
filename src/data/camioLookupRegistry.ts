type CamioLookupMap = Readonly<Record<string, string>>

let excelToInternalCamioCode: CamioLookupMap = {}

function normalitza(s: string): string {
  return s.trim().toUpperCase()
}

export function setCamioLookupFromExcel(map: Record<string, string>): void {
  const out: Record<string, string> = {}
  for (const [excelCode, internalCode] of Object.entries(map)) {
    const e = normalitza(excelCode)
    const i = normalitza(internalCode)
    if (!e || !i) continue
    out[e] = i
  }
  excelToInternalCamioCode = out
}

export function getInternalCamioCodeFromExcel(codiExcel: string): string | null {
  const key = normalitza(codiExcel)
  if (!key) return null
  return excelToInternalCamioCode[key] ?? null
}
