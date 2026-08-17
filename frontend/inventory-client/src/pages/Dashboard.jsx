import React, { useEffect, useState } from 'react'
import { getSummary } from '../api/dashboard'
import Spinner from '../components/Spinner'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const s = await getSummary()
      setSummary(s)
    } catch (e) { setError(e.message || 'Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h2>Dashboard</h2>
      {loading && <div className="center"><Spinner /></div>}
      {error && <div className="error">{error}</div>}

      {summary && (
        <>
          <div className="cards">
            <div className="card">
              <div className="card-title">Total products</div>
              <div className="card-value">{summary.totalProducts}</div>
            </div>
            <div className="card">
              <div className="card-title">Total stock value</div>
              <div className="card-value">${Number(summary.totalStockValue).toFixed(2)}</div>
            </div>
            <div className="card">
              <div className="card-title">Low stock count</div>
              <div className="card-value">{summary.lowStockCount}</div>
            </div>
          </div>

          <h3>Low stock</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>SKU</th><th>Qty</th><th>Reorder</th></tr></thead>
              <tbody>
                {summary.lowStockProducts.map(p => (
                  <tr key={p.id}><td>{p.name}</td><td>{p.sku}</td><td>{p.quantity}</td><td>{p.reorderLevel}</td></tr>
                ))}
                {summary.lowStockProducts.length === 0 && <tr><td colSpan={4}>No low stock items</td></tr>}
              </tbody>
            </table>
          </div>

          <h3>Recent transactions</h3>
          <div className="list">
            {summary.recentTransactions.map(tx => (
              <div key={tx.id} className="list-item">
                <div>{new Date(tx.timestamp).toLocaleString()}</div>
                <div>{tx.type} {tx.quantity} of product #{tx.productId}</div>
                <div className="muted">{tx.note}</div>
              </div>
            ))}
            {summary.recentTransactions.length === 0 && <div>No recent transactions</div>}
          </div>
        </>
      )}
    </div>
  )
}
