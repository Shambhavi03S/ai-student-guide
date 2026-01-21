import { useState, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ParentDashboard from "./ParentDashboard";
import "./App.css";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [imageText, setImageText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [question, setQuestion] = useState("");
  const [steps, setSteps] = useState([]);
  const [thinking, setThinking] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  /* ---------- LOGIN ---------- */
  const login = () => {
    if (name.trim()) setLoggedIn(true);
  };

  /* ---------- OCR ---------- */
  const readImage = async (file) => {
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("https://ai-student-guide-backend.onrender.com/api/read-image", {
      method: "POST",
      body: fd
    });

    const data = await res.json();
    setImageText(data.text || "");
  };

  /* ---------- ASK AI ---------- */
  const askAI = async () => {
    setThinking(true);
    setSteps([]);

    try {
      const res = await fetch("https://ai-student-guide-backend.onrender.com/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: name,
          subject,
          question: `${imageText}\n${question}`
        })
      });

      const data = await res.json();
      setSteps(data.steps || []);

      /* ---------- SAFE HISTORY SAVE ---------- */
      let history = [];
      try {
        const stored = localStorage.getItem("history");
        history = stored ? JSON.parse(stored) : [];
      } catch {
        history = [];
      }

      if (!Array.isArray(history)) history = [];

      history.unshift({
        student: name,
        subject,
        question,
        ocrText: imageText,
        time: new Date().toLocaleString()
      });

      localStorage.setItem("history", JSON.stringify(history.slice(0, 50)));
    } catch {
      setSteps(["AI service error. Please try again."]);
    }

    // Auto clear image
    setImageText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setThinking(false);
  };

  /* ---------- LOGIN SCREEN ---------- */
  if (!loggedIn) {
    return (
      <div className="login">
        <h1>🤖 AI-Guide</h1>
        <input
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button onClick={login}>Start Learning</button>
      </div>
    );
  }

  /* ---------- ROUTES ---------- */
  return (
    <Routes>
      {/* STUDENT VIEW */}
      <Route
        path="/"
        element={
          <div className="app">
            <aside className="sidebar">
              <h2>🤖 AI-Guide</h2>
              <button onClick={() => navigate("/")}>🏠 Student</button>
              <button onClick={() => navigate("/parent")}>👨‍👩‍👧 Parent</button>
              <button onClick={() => setLoggedIn(false)}>🚪 Logout</button>
            </aside>

            <main className="main">
              <h1>Welcome, {name} 👋</h1>

              <div className="subjects">
                {["Mathematics", "Science", "English"].map(s => (
                  <button
                    key={s}
                    className={subject === s ? "active" : ""}
                    onClick={() => {
                      setSubject(s);
                      setQuestion("");
                      setImageText("");
                      setImagePreview(null);
                      setSteps([]);
                      if (fileInputRef.current)
                        fileInputRef.current.value = "";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="card">
                <h3>📷 Upload Question Image</h3>
                <span className="badge">📘 {subject}</span>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => readImage(e.target.files[0])}
                />

                {imagePreview && (
                  <img src={imagePreview} className="preview" alt="preview" />
                )}

                {imageText && (
                  <textarea
                    value={imageText}
                    onChange={e => setImageText(e.target.value)}
                    placeholder="Edit OCR text if needed"
                  />
                )}
              </div>

              <div className="card">
                <h3>✍️ Ask a Question</h3>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                />

                {question && (
                  <button onClick={askAI} disabled={thinking}>
                    {thinking ? "🤖 Thinking..." : "Ask AI"}
                  </button>
                )}
              </div>

              {steps.map((s, i) => (
                <div key={i} className="step">
                  🌟 Step {i + 1}: {s}
                </div>
              ))}
            </main>
          </div>
        }
      />

      {/* PARENT DASHBOARD */}
      <Route path="/parent" element={<ParentDashboard />} />
    </Routes>
  );
}
