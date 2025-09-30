// src/pages/admin/Login.jsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Правильный путь:
import { AuthContext } from '../../context/AuthContext'; // ← два уровня вверх

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // ⚠️ Ты объявил navigate, но не используешь — отсюда warning

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      login(data); // успешный вход
      navigate('/');
    } else {
      const err = await res.json();

      // ✅ Обработка ошибки: извлекаем сообщение
      if (err.detail && Array.isArray(err.detail)) {
        // Pydantic validation error
        setError(err.detail.map(e => e.msg).join(', '));
      } else if (err.detail && typeof err.detail === 'string') {
        // Простая строка, например: "Invalid credentials"
        setError(err.detail);
      } else {
        setError('Login failed');
      }
    }
  } catch (err) {
    setError('Connection error. Server may be down.');
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">🔐 Admin Login</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;