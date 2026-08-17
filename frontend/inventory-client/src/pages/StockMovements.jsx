import React, { useEffect, useState } from 'react'
import { getProducts } from '../api/products'
import { postTransaction, getTransactions } from '../api/stock'
import Spinner from '../components/Spinner'

export default function StockMovements() {
  const [products, setProducts] = useState([])
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ productId: '', type: 'In', quantity: 1, note: '' })
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true); setError(null)
    try {
      const [p, t] = await Promise.all([getProducts(), getTransactions({ limit: 20 })])
      setProducts(p || [])
      setTxs(t || [])
    } catch (e) { setError(e.message || 'Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function handleChange(e) { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })) }

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true); setError(null)
    try {
      const payload = { productId: Number(form.productId), type: form.type, quantity: Number(form.quantity), note: form.note }
      const tx = await postTransaction(payload)
      setTxs(t => [tx, ...t])
      setForm({ productId: '', type: 'In', quantity: 1, note: '' })
    } catch (e) { setError(e.message || 'Failed to submit') } finally { setSubmitting(false) }
  }

  return (
    <div>
      <h2>Stock Movements</h2>
      {loading && <div className="center"><Spinner /></div>}
      {error && <div className="error">{error}</div>}

      <div className="panel">
        <form className="simple-form" onSubmit={submit}>
          <label>Product
            <select name="productId" value={form.productId} onChange={handleChange}>
              <option value="">-- Select --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </label>

          <label>Type
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="In">In</option>
              <option value="Out">Out</option>
            </select>
          </label>

          <label>Quantity
            <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} />
          </label>

          <label>Note
            <input name="note" value={form.note} onChange={handleChange} />
          </label>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Record'}</button>
          </div>
        </form>
      </div>

      <h3>Recent Transactions</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>When</th><th>Product</th><th>Type</th><th>Qty</th><th>Note</th></tr></thead>
          <tbody>
            {txs.map(tx => (
              <tr key={tx.id}>
                <td>{new Date(tx.timestamp).toLocaleString()}</td>
                <td>{(products.find(p => p.id === tx.productId) || {}).name || tx.productId}</td>
                <td>{tx.type}</td>
                <td>{tx.quantity}</td>
                <td>{tx.note}</td>
              </tr>
            ))}
            {txs.length === 0 && <tr><td colSpan={5}>No transactions</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
