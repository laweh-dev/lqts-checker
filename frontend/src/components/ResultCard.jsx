const COLOURS = {
    safe:    { bg: "#f0fdf4", border: "#86efac", badge: "#16a34a", label: "SAFE" },
    caution: { bg: "#fffbeb", border: "#fcd34d", badge: "#d97706", label: "CAUTION" },
    avoid:   { bg: "#fef2f2", border: "#fca5a5", badge: "#dc2626", label: "AVOID" },
    unknown: { bg: "#f8fafc", border: "#e2e8f0", badge: "#64748b", label: "UNKNOWN" }
  }
  
  export default function ResultCard({ result }) {
    if (result.error) {
      return (
        <div style={{ padding: "16px", background: "#fef2f2", borderRadius: "8px", color: "#dc2626" }}>
          {result.error}
        </div>
      )
    }
  
    const style = COLOURS[result.overall_verdict] || COLOURS.unknown
  
    return (
      <div style={{
        border: `1px solid ${style.border}`,
        background: style.bg,
        borderRadius: "12px",
        padding: "20px",
        width: "100%"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <span style={{
            background: style.badge,
            color: "white",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600"
          }}>
            {style.label}
          </span>
          <span style={{ fontSize: "16px", fontWeight: "500" }}>{result.medicine}</span>
        </div>
  
        <p style={{ fontSize: "15px", color: "#374151", marginBottom: "16px", lineHeight: "1.6" }}>
          {result.plain_english}
        </p>
  
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Ingredients checked
          </p>
          {result.ingredients.map((ing, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #f3f4f6",
              fontSize: "14px"
            }}>
              <span style={{ color: "#374151" }}>{ing.ingredient_name}</span>
              <span style={{ color: "#6b7280" }}>{ing.risk_category}</span>
            </div>
          ))}
        </div>
  
        <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "16px" }}>
          Always consult your cardiologist before taking any new medication.
        </p>
      </div>
    )
  }