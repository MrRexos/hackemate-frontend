export function splitDisplayProductNames(product: string | readonly string[]): string[] {
  const products: readonly string[] = typeof product === 'string' ? [product] : product
  const productLabel = products
    .map((name) => name.trim())
    .filter(Boolean)
    .join(' + ')

  return productLabel ? [productLabel] : []
}

export function formatDisplayProductTitle(
  product: string | readonly string[],
  fallback = '',
) {
  const products = splitDisplayProductNames(product)
  return products.length > 0 ? products.join('\n') : fallback
}
