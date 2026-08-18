<<<<<<< Updated upstream
// Placeholder for product-related API calls
// Example export:
// export async function fetchProducts() { return client.get('/api/products') }
=======
import client from './client'
import { USE_MOCK } from './config'

// Mock store (in-memory) for rapid frontend dev
let mockCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Office' },
  { id: 3, name: 'Kitchen' },
]

let mockProducts = [
  { id: 1, name: 'USB Cable', sku: 'USB-C-001', categoryId: 1, price: 4.99, quantity: 100, reorderLevel: 10 },
  { id: 2, name: 'Stapler', sku: 'STPL-002', categoryId: 2, price: 8.5, quantity: 25, reorderLevel: 5 },
  { id: 3, name: 'Coffee Mug', sku: 'MUG-003', categoryId: 3, price: 6.0, quantity: 12, reorderLevel: 5 },
]
let nextProductId = 4

const fakeDelay = (v, ms = 300) => new Promise((res) => setTimeout(() => res(v), ms))

// Normalize backend response to use 'quantity' field name for consistency with frontend
const normalizeProductFromBackend = (p) => ({
  ...p,
  quantity: p.quantityInStock || p.quantity
})

// Prepare payload for backend - use 'quantityInStock' field name
const prepareProductForBackend = (p) => ({
  name: p.name,
  sku: p.sku,
  categoryId: Number(p.categoryId),
  price: Number(p.price),
  quantityInStock: Number(p.quantity),
  reorderLevel: Number(p.reorderLevel)
})

export async function getProducts({ search, categoryId, sortBy, sortDir } = {}) {
  if (USE_MOCK) {
    let list = [...mockProducts]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    }
    if (categoryId) {
      list = list.filter(p => Number(p.categoryId) === Number(categoryId))
    }
    if (sortBy) {
      list.sort((a, b) => {
        const dir = sortDir === 'desc' ? -1 : 1
        if (a[sortBy] < b[sortBy]) return -1 * dir
        if (a[sortBy] > b[sortBy]) return 1 * dir
        return 0
      })
    }
    return fakeDelay(list)
  }

  const params = {}
  if (search) params.search = search
  if (categoryId) params.categoryId = categoryId
  if (sortBy) params.sortBy = sortBy
  if (sortDir) params.sortDir = sortDir
  const resp = await client.get('/api/products', { params })
  return (resp.data || []).map(normalizeProductFromBackend)
}

export async function createProduct(payload) {
  if (USE_MOCK) {
    const rec = { id: nextProductId++, ...payload }
    mockProducts.push(rec)
    return fakeDelay(rec)
  }
  const resp = await client.post('/api/products', prepareProductForBackend(payload))
  return normalizeProductFromBackend(resp.data)
}

export async function updateProduct(id, payload) {
  if (USE_MOCK) {
    const idx = mockProducts.findIndex(p => p.id === Number(id))
    if (idx === -1) throw new Error('Not found')
    mockProducts[idx] = { ...mockProducts[idx], ...payload }
    return fakeDelay(mockProducts[idx])
  }
  const resp = await client.put(`/api/products/${id}`, prepareProductForBackend(payload))
  return normalizeProductFromBackend(resp.data)
}

export async function deleteProduct(id) {
  if (USE_MOCK) {
    mockProducts = mockProducts.filter(p => p.id !== Number(id))
    return fakeDelay({ success: true })
  }
  const resp = await client.delete(`/api/products/${id}`)
  return resp.data
}

export async function getProductById(id) {
  if (USE_MOCK) {
    const p = mockProducts.find(x => x.id === Number(id))
    return fakeDelay(p)
  }
  const resp = await client.get(`/api/products/${id}`)
  return normalizeProductFromBackend(resp.data)
}
>>>>>>> Stashed changes
