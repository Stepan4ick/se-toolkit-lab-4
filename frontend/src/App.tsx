import { useState, useEffect, FormEvent } from 'react'
import './App.css'

const STORAGE_KEY = 'api_token'

interface Item {
  id: number
  type: string
  title: string
  description: string
  created_at: string
}

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? '',
  )
  const [draft, setDraft] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    setLoading(true)
    setError(null)

    fetch('/items', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Item[]) => {
        setItems(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [token])

  function handleConnect(e: FormEvent) {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    localStorage.setItem(STORAGE_KEY, trimmed)
    setToken(trimmed)
    setDraft('')
  }

  function handleDisconnect() {
    localStorage.removeItem(STORAGE_KEY)
    setToken('')
    setDraft('')
    setItems([])
    setError(null)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString()
  }

  if (!token) {
    return (
      <form className="token-form" onSubmit={handleConnect}>
        <h1>API Token</h1>
        <p>Enter your API token to connect.</p>
        <input
          type="password"
          placeholder="Enter your token"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!draft.trim()}>
          Connect
        </button>
      </form>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Items</h1>
        <div className="header-controls">
          <span className="items-count">Total: {items.length}</span>
          <button className="btn-disconnect" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      </header>

      {loading && (
        <div className="loading-container">
          <p>Loading items...</p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <p>No items found</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <table className="items-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Title</th>
              <th>Description</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <span className={`item-type type-${item.type.toLowerCase()}`}>
                    {item.type}
                  </span>
                </td>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{formatDate(item.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App