import { useEffect, useState } from "react";

export default function Quiz({ subject, onClose }) {
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    generateQuiz();
  }, [subject]);

  const generateQuiz = async () => {
    setQuiz(null);
    setSelected(null);
    setResult("");

    const res = await fetch("http://localhost:5000/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        question: `
Create ONE fun multiple choice quiz question for kids.

Rules:
- Exactly 1 correct answer
- 4 options
- Simple language
- Do not explain answer

Return ONLY JSON:
{
  "question": "...",
  "options": ["A","B","C","D"],
  "answer": "correct option"
}
`
      })
    });

    const data = await res.json();

    try {
      const parsed = JSON.parse(data.reply);
      setQuiz(parsed);
    } catch {
      setQuiz(null);
    }
  };

  const checkAnswer = () => {
    if (!selected) return;

    if (selected === quiz.answer) {
      setResult("🎉 Correct! Great job!");
    } else {
      setResult("🙂 Not quite. Try again!");
    }
  };

  if (!quiz) {
    return (
      <div className="card quiz">
        <h3>Quiz Time 🎯</h3>
        <p>Preparing a fun question...</p>
      </div>
    );
  }

  return (
    <div className="card quiz">
      <h3>Quiz Time 🎯</h3>

      <p className="quiz-question">{quiz.question}</p>

      <div className="quiz-options">
        {quiz.options.map((opt, i) => (
          <button
            key={i}
            className={`quiz-option option-${i} ${selected === opt ? "selected" : ""}`}
            onClick={() => setSelected(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      <button onClick={checkAnswer}>Check Answer</button>

      {result && <p className="quiz-result">{result}</p>}

      <button className="close-quiz" onClick={onClose}>
        Close Quiz ❌
      </button>
    </div>
  );
}
