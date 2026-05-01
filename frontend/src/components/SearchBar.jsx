import { useState } from "react"

export default function SearchBar({ onResult, onLoading }) {
  const [medicine, setMedicine] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    if (!medicine.trim()) return
    onLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/check/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicine })
      })
      const data = await response.json()
      onResult(data)
    } catch (err) {
      onResult({ error: "Could not reach the server. Is the backend running?" })
    } finally {
      onLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", width: "100%" }}>
      <input
        type="text"
        value={medicine}
        onChange={e => setMedicine(e.target.value)}
        placeholder="Type a medicine name e.g. Lemsip Max"
        style={{
          flex: 1,
          padding: "12px 16px",
          fontSize: "16px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          outline: "none"
        }}
      />
      <button
        type="submit"
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Check
      </button>
    </form>
  )
}