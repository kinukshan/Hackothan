import React, { useState, useEffect } from 'react'

export default function ProductForm({ initial = {}, categories = [], onCancel, onSubmit }) {
  const [form, setForm] = useState({
    name: '', sku: '', categoryId: '', price: 0, quantity: 0, reorderLevel: 0,
    ...initial
  })
  const [errors, setErrors] = useState({})

  useEffect(() => setForm(f => ({ ...f, ...initial })), [initial])

  function validate() {
    const e = {}
    if (!form.name || !form.name.trim()) e.name = 'Name is required'
    if (!form.sku || !/^[A-Za-z0-9-]{3,}$/.test(form.sku)) e.sku = 'SKU required (alphanumeric, dash, min 3 chars)'
    if (!form.categoryId) e.categoryId = 'Category is required'
    if (form.price == null || Number(form.price) < 0) e.price = 'Price must be >= 0'
    if (form.quantity == null || Number(form.quantity) < 0) e.quantity = 'Quantity must be >= 0'
    if (form.reorderLevel == null || Number(form.reorderLevel) < 0) e.reorderLevel = 'Reorder level must be >= 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function submit(e) {
    e.preventDefault()
    if (!validate()) return
    // normalize numeric fields
    const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity), reorderLevel: Number(form.reorderLevel), categoryId: Number(form.categoryId) }
    onSubmit(payload)
  }

  return (
    <form onSubmit={submit} className="simple-form">
      <label>Product Name
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <div className="field-error">{errors.name}</div>}
      </label>

      <label>SKU
        <input name="sku" value={form.sku} onChange={handleChange} />
        {errors.sku && <div className="field-error">{errors.sku}</div>}
      </label>

      <label>Category
        <select name="categoryId" value={form.categoryId} onChange={handleChange}>
          <option value="">-- Select --</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.categoryId && <div className="field-error">{errors.categoryId}</div>}
      </label>

      <label>Price
        <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
        {errors.price && <div className="field-error">{errors.price}</div>}
      </label>

      <label>Quantity
        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} />
        {errors.quantity && <div className="field-error">{errors.quantity}</div>}
      </label>

      <label>Reorder level
        <input name="reorderLevel" type="number" value={form.reorderLevel} onChange={handleChange} />
        {errors.reorderLevel && <div className="field-error">{errors.reorderLevel}</div>}
      </label>

      <div className="form-actions">
        <button className="btn" type="submit">Save</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
