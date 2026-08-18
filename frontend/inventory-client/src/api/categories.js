import client from './client'
import { USE_MOCK } from './config'

let mockCategories = [
  { id: 1, name: 'Electronics', description: 'Gadgets and accessories' },
  { id: 2, name: 'Office', description: 'Office supplies' },
  { id: 3, name: 'Kitchen', description: 'Kitchenware' },
]
let nextCategoryId = 4

const fakeDelay = (v, ms = 250) => new Promise(res => setTimeout(() => res(v), ms))

export async function getCategories() {
  if (USE_MOCK) return fakeDelay([...mockCategories])
  const resp = await client.get('/api/categories')
  return resp.data
}

export async function createCategory(payload) {
  if (USE_MOCK) {
    const rec = { id: nextCategoryId++, ...payload }
    mockCategories.push(rec)
    return fakeDelay(rec)
  }
  const resp = await client.post('/api/categories', payload)
  return resp.data
}

export async function updateCategory(id, payload) {
  if (USE_MOCK) {
    const idx = mockCategories.findIndex(c => c.id === Number(id))
    if (idx === -1) throw new Error('Not found')
    mockCategories[idx] = { ...mockCategories[idx], ...payload }
    return fakeDelay(mockCategories[idx])
  }
  const resp = await client.put(`/api/categories/${id}`, payload)
  return resp.data
}

export async function deleteCategory(id) {
  if (USE_MOCK) {
    mockCategories = mockCategories.filter(c => c.id !== Number(id))
    return fakeDelay({ success: true })
  }
  const resp = await client.delete(`/api/categories/${id}`)
  return resp.data
}
