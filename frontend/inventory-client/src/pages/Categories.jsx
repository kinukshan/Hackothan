import React, { useEffect, useState } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import CategoryForm from '../components/CategoryForm'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function load() {
    setLoading(true); setError(null)
    try {
      const cats = await getCategories()
      setCategories(cats || [])
    } catch (e) { setError(e.message || 'Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setShowModal(true) }
  function openEdit(c) { setEditing(c); setShowModal(true) }

  async function handleCreate(payload) {
    try {
      const created = await createCategory(payload)
      setCategories(c => [created, ...c])
      setShowModal(false)
    } catch (e) { setError(e.message || 'Failed to create') }
  }

  async function handleUpdate(payload) {
    try {
      const updated = await updateCategory(editing.id, payload)
      setCategories(c => c.map(x => x.id === updated.id ? updated : x))
      setShowModal(false); setEditing(null)
    } catch (e) { setError(e.message || 'Failed to update') }
  }

  function confirmDelete(c) { setToDelete(c); setConfirmOpen(true) }
  async function doDelete() {
    try {
      await deleteCategory(toDelete.id)
      setCategories(c => c.filter(x => x.id !== toDelete.id))
      setConfirmOpen(false); setToDelete(null)
    } catch (e) { setError(e.message || 'Failed to delete') }
  }

  return (
    <div>
      <div className="page-actions">
        <h2>Categories</h2>
        <div>
          <button className="btn" onClick={openAdd}>Add Category</button>
        </div>
      </div>

      {loading && <div className="center"><Spinner /></div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}><td>{c.name}</td><td>{c.description}</td><td>
                  <button className="btn btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(c)}>Delete</button>
                </td></tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={3}>No categories</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Category' : 'Add Category'} onClose={() => setShowModal(false)}>
          <CategoryForm initial={editing || {}} onCancel={() => setShowModal(false)} onSubmit={editing ? handleUpdate : handleCreate} />
        </Modal>
      )}

      <ConfirmDialog open={confirmOpen} title="Delete category" message={`Delete ${toDelete?.name}?`} onConfirm={doDelete} onCancel={() => setConfirmOpen(false)} />
    </div>
  )
}
