import React from 'react'
import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="app-root">
      <nav className="sidebar">
        <h2 className="brand">Inventory</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/categories">Categories</Link></li>
          <li><Link to="/stock-movements">Stock Movements</Link></li>
        </ul>
      </nav>

      <main className="content">
        <header className="topbar">Welcome — Inventory Management (Hackathon)</header>
        <section className="page">{children}</section>
      </main>
    </div>
  )
}
