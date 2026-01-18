export default function Login({ onLogin }) {
  let name = "";

  return (
    <div className="login">
      <h2>Student Login</h2>
      <input
        placeholder="Enter student name"
        onChange={e => (name = e.target.value)}
      />
      <button onClick={() => name && onLogin(name)}>Login</button>
    </div>
  );
}
