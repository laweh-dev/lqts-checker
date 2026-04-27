import { useState } from "react"
import SearchBar from "./components/SearchBar"
import ResultCard from "./components/ResultCard"

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f9fafb",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 20px"
    }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>

        <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "8px", color: "#111827" }}>
          LQTS Medicine Checker
        </h1>
        <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "32px" }}>
          Check if a medicine is safe for people with Long QT Syndrome
        </p>

        <SearchBar onResult={setResult} onLoading={setLoading} />

        {loading && (
          <p style={{ marginTop: "24px", color: "#6b7280", textAlign: "center" }}>
            Checking ingredients...
          </p>
        )}

        {result && !loading && (
          <div style={{ marginTop: "24px" }}>
            <ResultCard result={result} />
          </div>
        )}

      </div>
    </div>
  )
}