import React, { useState } from 'react';
import api from './api';

const Login = ({ onSwitch, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/user/login', { email, password });

      console.log("Resposta completa do login:", response.data); // 🐞 debug

      if (response?.data?.message === 'Login efetuado com sucesso!' && response.data.token) {
        // ✅ Guardar o token no localStorage
        localStorage.setItem("token", response.data.token);

        const userData = {
          id: response.data.id,
          nome: response.data.name,
          email: response.data.email,
          moderator: response.data.moderator || 0
        };

        onLoginSuccess(userData);
      } else {
        alert('Credenciais inválidas ou token não recebido.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      alert('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Entrar'}
        </button>

        
        <p className="link" onClick={() => onSwitch('register')}>Ainda não tem conta? Registar</p>
      </form>
    </div>
  );
};

export default Login;
