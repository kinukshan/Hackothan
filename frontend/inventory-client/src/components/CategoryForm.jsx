import React, { useState, useEffect } from 'react'

export default function CategoryForm({ initial = {}, onCancel, onSubmit }) {
  const [form, setForm] = useState({ name: '', description: '', ...initial })
  const [errors, setErrors] = useState({})

  useEffect(() => setForm(f => ({ ...f, ...initial })), [initial])

  function validate() {
    const e = {}
    if (!form.name || !form.name.trim()) e.name = 'Name is required'
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
    onSubmit({ ...form })
  }

  return (
    <form onSubmit={submit} className="simple-form">
      <label>Name
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <div className="field-error">{errors.name}</div>}
      </label>

      <label>Description
        <textarea name="description" value={form.description} onChange={handleChange} />
      </label>

      <div className="form-actions">
        <button className="btn" type="submit">Save</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
