import client from './client'
import { USE_MOCK } from './config'
import { getProducts } from './products'
import { getTransactions } from './stock'

const fakeDelay = (v, ms = 250) => new Promise(res => setTimeout(() => res(v), ms))

export async function getSummary() {
  if (USE_MOCK) {
    const products = await getProducts()
    const transactions = await getTransactions({ limit: 10 })
    const totalProducts = products.length
    const totalStockValue = products.reduce((s, p) => s + (p.price || 0) * (p.quantity || 0), 0)
    const lowStockProducts = products.filter(p => (p.quantity ?? 0) <= (p.reorderLevel ?? 0))
    return fakeDelay({
      totalProducts,
      totalStockValue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentTransactions: transactions
    })
  }

  const resp = await client.get('/api/dashboard/summary')
  return resp.data
}
