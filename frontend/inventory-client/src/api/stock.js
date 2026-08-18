import client from './client'
import { USE_MOCK } from './config'

let mockTransactions = [
  { id: 1, productId: 1, type: 'In', quantity: 50, note: 'Initial stock', timestamp: new Date().toISOString() },
  { id: 2, productId: 3, type: 'Out', quantity: 2, note: 'Customer sale', timestamp: new Date().toISOString() },
]
let nextTxId = 3

const fakeDelay = (v, ms = 250) => new Promise(res => setTimeout(() => res(v), ms))

export async function postTransaction(payload) {
  if (USE_MOCK) {
    const rec = { id: nextTxId++, ...payload, timestamp: new Date().toISOString() }
    mockTransactions.unshift(rec)
    return fakeDelay(rec)
  }
  const resp = await client.post('/api/stock/transactions', payload)
  return resp.data
}

export async function getTransactions({ limit = 10 } = {}) {
  if (USE_MOCK) {
    return fakeDelay(mockTransactions.slice(0, limit))
  }
  const resp = await client.get('/api/stock/transactions', { params: { limit } })
  return resp.data
}
