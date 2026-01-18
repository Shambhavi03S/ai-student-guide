import { useNavigate } from "react-router-dom";

export default function ParentDashboard() {
  const navigate = useNavigate();

  let history = [];

  try {
    const stored = localStorage.getItem("history");
    history = stored ? JSON.parse(stored) : [];
  } catch {
    history = [];
  }

  if (!Array.isArray(history)) history = [];

  return (
    <div className="main">
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => navigate("/")}>🏠 Home</button>
        <h1 style={{ margin: 0 }}>👨‍👩‍👧 Parent Dashboard</h1>
      </div>

      <br />

      {history.length === 0 && <p>No student activity yet.</p>}

      {history.map((h, i) => (
        <div key={i} className="card">
          <b>{h.student}</b> — {h.subject}
          <br />

          <strong>Question:</strong>
          <div>{h.question}</div>

          {h.ocrText && (
            <>
              <strong>OCR Text:</strong>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {h.ocrText}
              </div>
            </>
          )}

          <small>{h.time}</small>
        </div>
      ))}
    </div>
  );
}
