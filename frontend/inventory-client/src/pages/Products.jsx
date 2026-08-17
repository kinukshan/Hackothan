import React, { useEffect, useState, useMemo } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products'
import { getCategories } from '../api/categories'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ProductForm from '../components/ProductForm'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortDir, setSortDir] = useState('asc')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts({ search, categoryId: filterCategory, sortBy, sortDir })])
      setCategories(cats || [])
      setProducts(prods || [])
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, filterCategory, sortBy, sortDir])

  function clearSort() { setSortBy(''); setSortDir('asc') }
  function toggleSort(field) {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('asc') }
  }

  async function handleCreate(data) {
    try {
      const created = await createProduct(data)
      setProducts(p => [created, ...p])
      setShowModal(false)
    } catch (e) { setError(e.message || 'Failed to create') }
  }

  async function handleUpdate(data) {
    try {
      const updated = await updateProduct(editing.id, data)
      setProducts(p => p.map(x => x.id === updated.id ? updated : x))
      setShowModal(false); setEditing(null)
    } catch (e) { setError(e.message || 'Failed to update') }
  }

  function openEdit(p) { setEditing(p); setShowModal(true) }
  function openAdd() { setEditing(null); setShowModal(true) }

  function confirmDelete(p) { setToDelete(p); setConfirmOpen(true) }
  async function doDelete() {
    try {
      await deleteProduct(toDelete.id)
      setProducts(p => p.filter(x => x.id !== toDelete.id))
      setConfirmOpen(false); setToDelete(null)
    } catch (e) { setError(e.message || 'Failed to delete') }
  }

  const catById = useMemo(() => Object.fromEntries((categories || []).map(c => [c.id, c])), [categories])

  return (
    <div>
      <div className="page-actions">
        <div className="search-row">
          <input placeholder="Search name or SKU" value={search} onChange={e => setSearch(e.target.value)} />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn" onClick={() => { clearSort(); setSearch(''); setFilterCategory('') }}>Reset</button>
        </div>
        <div>
          <button className="btn" onClick={openAdd}>Add Product</button>
        </div>
      </div>

      {loading && <div className="center"><Spinner /></div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('name')}>Name {sortBy === 'name' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                <th onClick={() => toggleSort('sku')}>SKU {sortBy === 'sku' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                <th>Category</th>
                <th onClick={() => toggleSort('price')}>Price {sortBy === 'price' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                <th onClick={() => toggleSort('quantity')}>Qty {sortBy === 'quantity' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                <th>Reorder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{(catById[p.categoryId] && catById[p.categoryId].name) || '-'}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.quantity}</td>
                  <td>{p.reorderLevel}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(p)}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={7}>No products</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setShowModal(false)}>
          <ProductForm initial={editing || {}} categories={categories} onCancel={() => setShowModal(false)} onSubmit={editing ? handleUpdate : handleCreate} />
        </Modal>
      )}

      <ConfirmDialog open={confirmOpen} title="Delete product" message={`Delete ${toDelete?.name}?`} onConfirm={doDelete} onCancel={() => setConfirmOpen(false)} />
    </div>
  )
}
